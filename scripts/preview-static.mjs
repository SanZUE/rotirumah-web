#!/usr/bin/env node
/**
 * Server statis untuk melihat hasil `npm run build` (folder out/) secara lokal,
 * dengan perilaku yang sama seperti GitHub Pages project site:
 * situs dilayani di bawah /rotirumah-web/.
 *
 * Pakai: npm run preview   ->  http://localhost:4321/rotirumah-web/
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = Number(process.env.PORT || 4321);
const ROOT = 'out';
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '/rotirumah-web';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};

async function resolveFile(pathname) {
  let target = pathname;
  if (target.startsWith(BASE)) target = target.slice(BASE.length) || '/';
  if (!target.startsWith('/')) target = `/${target}`;
  target = decodeURIComponent(target.split('?')[0]);
  if (target.endsWith('/')) target += 'index.html';
  if (!extname(target)) target += '/index.html';

  const file = join(ROOT, target);
  try {
    const info = await stat(file);
    if (info.isFile()) return file;
  } catch {
    // lanjut ke fallback
  }
  return null;
}

const server = createServer(async (request, response) => {
  const url = request.url || '/';

  // Hanya redirect untuk root tanpa base path; jangan pernah redirect ${BASE}/ ke dirinya sendiri.
  if (url === '/' || url === BASE) {
    response.writeHead(302, { location: `${BASE}/` });
    response.end();
    return;
  }

  const file = await resolveFile(url);

  if (!file) {
    try {
      const notFound = await readFile(join(ROOT, '404.html'));
      response.writeHead(404, { 'content-type': MIME['.html'] });
      response.end(notFound);
      return;
    } catch {
      response.writeHead(404, { 'content-type': MIME['.txt'] });
      response.end('404');
      return;
    }
  }

  const ext = extname(file);
  const body = await readFile(file);
  response.writeHead(200, {
    'content-type': MIME[ext] || 'application/octet-stream',
    'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  response.end(body);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Preview: http://localhost:${PORT}${BASE}/`);
  console.log(`Melayani folder ${ROOT}/ pada base path ${BASE}`);
});
