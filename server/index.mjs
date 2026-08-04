import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const root = path.resolve(__dirname, '..');
const clientDist = path.resolve(root, 'dist', 'client');
const isProd = process.env.NODE_ENV === 'production';
const logLevel = (process.env.LOG_LEVEL || (isProd ? 'info' : 'debug')).toLowerCase();
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };

function log(level, fields) {
  if ((LEVELS[level] ?? LEVELS.info) < (LEVELS[logLevel] ?? LEVELS.info)) return;
  const entry = { time: new Date().toISOString(), level, ...fields };
  const line = JSON.stringify(entry);
  if (level === 'error' || level === 'warn') console.error(line);
  else console.log(line);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
};

let template;
try {
  template = fs.readFileSync(path.resolve(clientDist, 'index.html'), 'utf-8');
} catch (err) {
  log('error', { message: 'Unable to read client template', error: err.message, stack: err.stack });
  process.exit(1);
}

let render;
try {
  const serverEntry = await import(pathToFileURL(path.resolve(root, 'dist', 'server', 'entry-server.mjs')));
  render = serverEntry.render;
} catch (err) {
  log('error', { message: 'Unable to load SSR entry', error: err.message, stack: err.stack });
  process.exit(1);
}

const ERROR_PAGE = (status, title, message) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#f9fafb;color:#111827;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .box{max-width:440px;width:100%;text-align:center}
  .code{font-size:64px;font-weight:800;color:#d1d5db;line-height:1}
  h1{font-size:22px;margin:16px 0 8px}
  p{color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px}
  a{display:inline-block;background:#f59e0b;color:#fff;font-weight:600;text-decoration:none;padding:10px 22px;border-radius:9999px}
</style>
</head>
<body>
  <div class="box">
    <div class="code">${status}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/">Go to Homepage</a>
  </div>
</body>
</html>`;

const NOT_FOUND_PAGE = () =>
  ERROR_PAGE(404, 'Page not found', 'The page you are looking for does not exist or has been moved.');

const SERVER_ERROR_PAGE = () =>
  ERROR_PAGE(500, 'Something went wrong', 'An unexpected error occurred. Please try again in a moment.');

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Request-Id': '',
};

async function send(req, res, status, headers, body) {
  const accepts = (req.headers['accept-encoding'] || '').toLowerCase();
  const compressed = accepts.includes('gzip') && (typeof body === 'string' ? Buffer.byteLength(body) : body.length) > 512;
  if (compressed) {
    const buf = await gzipAsync(body);
    res.writeHead(status, {
      ...headers,
      'Content-Encoding': 'gzip',
      'Content-Length': buf.length,
      'Vary': 'Accept-Encoding',
    });
    res.end(buf);
    return;
  }
  res.writeHead(status, { ...headers, 'Content-Length': typeof body === 'string' ? Buffer.byteLength(body) : body.length });
  res.end(body);
}

function sendStatic(req, res, requestId, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  const isStatic = ext === '.js' || ext === '.css' || ext === '.map';
  const headers = {
    'Content-Type': mime,
    'Cache-Control': isStatic ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    ...SECURITY_HEADERS,
    'X-Request-Id': requestId,
  };
  return send(req, res, 200, headers, fs.readFileSync(filePath));
}

const server = http.createServer(async (req, res) => {
  const requestId = randomUUID();
  const started = Date.now();
  const reqUrl = req.url || '/';

  req.on('error', (err) => log('warn', { requestId, message: 'Request stream error', error: err.message }));
  res.on('error', (err) => log('warn', { requestId, message: 'Response stream error', error: err.message }));

  try {
    if (reqUrl === '/favicon.ico' || reqUrl === '/favicon.png') {
      const favPath = path.resolve(clientDist, reqUrl.slice(1));
      if (fs.existsSync(favPath)) {
        await sendStatic(req, res, requestId, favPath);
        log('info', { requestId, method: req.method, url: reqUrl, status: 200, ms: Date.now() - started });
        return;
      }
    }

    const ext = path.extname(reqUrl.split('?')[0].split('#')[0]);
    if (ext && ext !== '.html') {
      const filePath = path.resolve(clientDist, reqUrl.startsWith('/') ? reqUrl.slice(1) : reqUrl);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        await sendStatic(req, res, requestId, filePath);
        log('info', { requestId, method: req.method, url: reqUrl, status: 200, ms: Date.now() - started });
        return;
      }
      await send(req, res, 404, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS, 'X-Request-Id': requestId }, 'Not Found');
      log('info', { requestId, method: req.method, url: reqUrl, status: 404, ms: Date.now() - started });
      return;
    }

    let result;
    try {
      const appUrl = `http://localhost:${port}${reqUrl}`;
      result = await render(appUrl, template);
    } catch (err) {
      log('error', { requestId, message: 'SSR render error', error: err.message, stack: err.stack });
      await send(req, res, 500, {
        'Content-Type': 'text/html; charset=utf-8',
        ...SECURITY_HEADERS,
        'X-Request-Id': requestId,
      }, SERVER_ERROR_PAGE());
      log('info', { requestId, method: req.method, url: reqUrl, status: 500, ms: Date.now() - started });
      return;
    }

    const status = result.status || 200;
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      ...SECURITY_HEADERS,
      'X-Request-Id': requestId,
    };
    await send(req, res, status, headers, status >= 500 ? SERVER_ERROR_PAGE() : result.html);
    log('info', { requestId, method: req.method, url: reqUrl, status, ms: Date.now() - started });
  } catch (err) {
    log('error', { requestId, message: 'Unhandled request error', error: err.message, stack: err.stack });
    try {
      if (!res.headersSent) {
        await send(req, res, 500, { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS, 'X-Request-Id': requestId }, SERVER_ERROR_PAGE());
      } else {
        res.end();
      }
    } catch {
      res.destroy();
    }
  }
});

process.on('uncaughtException', (err) => {
  log('error', { message: 'Uncaught exception', error: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  log('error', { message: 'Unhandled promise rejection', error: message });
});

server.listen(port, host, () => {
  log('info', { message: 'SSR production server running', host, port });
});
