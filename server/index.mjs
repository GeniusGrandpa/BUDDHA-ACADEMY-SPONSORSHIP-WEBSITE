import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const root = path.resolve(__dirname, '..');
const clientDist = path.resolve(root, 'dist', 'client');

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

const template = fs.readFileSync(
  path.resolve(clientDist, 'index.html'),
  'utf-8'
);

const serverEntry = await import(pathToFileURL(path.resolve(root, 'dist', 'server', 'entry-server.mjs')));
const { render } = serverEntry;

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

const server = http.createServer(async (req, res) => {
  const reqUrl = req.url || '/';

  if (reqUrl === '/favicon.ico' || reqUrl === '/favicon.png') {
    const favPath = path.resolve(clientDist, reqUrl.slice(1));
    if (fs.existsSync(favPath)) {
      const ext = path.extname(favPath);
      await send(req, res, 200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' }, fs.readFileSync(favPath));
      return;
    }
  }

  const ext = path.extname(reqUrl.split('?')[0].split('#')[0]);
  if (ext && ext !== '.html') {
    const filePath = path.resolve(clientDist, reqUrl.startsWith('/') ? reqUrl.slice(1) : reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      const isStatic = ext === '.js' || ext === '.css' || ext === '.map';
      await send(req, res, 200, {
        'Content-Type': mime,
        'Cache-Control': isStatic ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
      }, fs.readFileSync(filePath));
      return;
    }
  }

  try {
    const appUrl = `http://localhost:${port}${reqUrl}`;
    const result = await render(appUrl, template);
    await send(req, res, 200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }, result.html);
  } catch (err) {
    console.error('SSR render error:', err);
    await send(req, res, 500, { 'Content-Type': 'text/html; charset=utf-8' }, template);
  }
});

server.listen(port, host, () => {
  console.log(`SSR production server running at http://${host === '0.0.0.0' ? '0.0.0.0' : host}:${port}`);
});
