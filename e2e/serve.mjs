// Builds the site and serves dist/ on :4173 for `npm run test:local` (same headers as vercel.json).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
execSync('node scripts/build.mjs', { cwd: root, stdio: 'inherit' });
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  try {
    if (path === '/version.json') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' }).end(await readFile(root + 'dist/version.json'));
    } else {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(root + 'dist/index.html'));
    }
  } catch (e) { res.writeHead(500).end(String(e)); }
}).listen(4173);
