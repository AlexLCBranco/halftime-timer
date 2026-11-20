// Builds dist/: index.html with the version label filled in, plus /version.json.
// Version: package.json's "version" (bumped with every app change; scripts/check-version.mjs enforces it in CI).
// Commit: Vercel's VERCEL_GIT_COMMIT_SHA, or git locally ("+" when the working tree has uncommitted changes).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const git = cmd => { try { return execSync(`git ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || git('rev-parse HEAD')).slice(0, 7);
const dirty = !process.env.VERCEL_GIT_COMMIT_SHA && git('status --porcelain') !== '';
const build = {
  version: JSON.parse(readFileSync('package.json', 'utf8')).version,
  commit: sha ? sha + (dirty ? '+' : '') : 'dev',
  builtAt: new Date().toISOString(),
};

const html = readFileSync('index.html', 'utf8')
  .replaceAll('__APP_VERSION__', build.version)
  .replaceAll('__APP_COMMIT__', build.commit)
  .replaceAll('__BUILT_AT__', build.builtAt);
if (/__(APP_VERSION|APP_COMMIT|BUILT_AT)__/.test(html)) throw new Error('build: placeholder left in index.html');

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
writeFileSync('dist/version.json', JSON.stringify(build));
console.log(`build: v${build.version} (${build.commit})`);
