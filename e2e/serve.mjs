// Serves the repo root (index.html) on :4173 for `npm run test:local`.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
createServer(async (req, res) => {
  try {
    const body = await readFile(root + 'index.html');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(body);
  } catch (e) { res.writeHead(500).end(String(e)); }
}).listen(4173);
