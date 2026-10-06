// Zero-dependency static server for Hostinger Node.js hosting.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

const BLOCKED = new Set(['server.js', 'package.json', 'README.md', '.htaccess', '.gitignore']);

function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  p = path.normalize(p).replace(/^(\.\.[\/\\])+/, '');
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) return null;
  if (BLOCKED.has(path.relative(ROOT, file)) || path.basename(file).startsWith('.')) return null;

  const candidates = [file];
  if (p.endsWith('/')) candidates.push(path.join(file, 'index.html'));
  // Clean URLs: /about or /about/ -> about.html
  candidates.push(file.replace(/\/$/, '') + '.html');

  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) return c;
    } catch (_) {}
  }
  return null;
}

http.createServer((req, res) => {
  const file = resolveFile(req.url === '/' ? '/index.html' : req.url);
  const status = file ? 200 : 404;
  const target = file || path.join(ROOT, '404.html');
  const ext = path.extname(target).toLowerCase();
  const headers = {
    'Content-Type': TYPES[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=2592000',
  };
  res.writeHead(status, headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(target).pipe(res);
}).listen(PORT, () => console.log(`Club Ceramic running on port ${PORT}`));
