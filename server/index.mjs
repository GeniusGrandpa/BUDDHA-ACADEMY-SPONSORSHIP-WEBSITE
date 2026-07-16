import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';

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

const server = http.createServer(async (req, res) => {
  const reqUrl = req.url || '/';

  if (reqUrl === '/favicon.ico' || reqUrl === '/favicon.png') {
    const favPath = path.resolve(clientDist, reqUrl.slice(1));
    if (fs.existsSync(favPath)) {
      const ext = path.extname(favPath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(favPath));
      return;
    }
  }

  const ext = path.extname(reqUrl.split('?')[0].split('#')[0]);
  if (ext && ext !== '.html') {
    const filePath = path.resolve(clientDist, reqUrl.startsWith('/') ? reqUrl.slice(1) : reqUrl);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      const isStatic = ext === '.js' || ext === '.css' || ext === '.map';
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': isStatic ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
      });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  try {
    const appUrl = `http://localhost:${port}${reqUrl}`;
    const result = await render(appUrl, template);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });
    res.end(result.html);
  } catch (err) {
    console.error('SSR render error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(template);
  }
});

server.listen(port, host, () => {
  console.log(`SSR production server running at http://${host === '0.0.0.0' ? '0.0.0.0' : host}:${port}`);
});
