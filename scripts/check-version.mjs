// CI: a commit that changes the app (anything that ends up on the site) must raise package.json's version
// (MAJOR.MINOR.PATCH), so the corner label on the live site always tells versions apart.
// Compares HEAD with its parent (CI checks out 2 commits). Exits 1 with the reason otherwise.
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

/** Files whose change doesn't need a new version: docs, lists, tests, CI and tooling. */
const NO_BUMP = [/\.md$/, /^e2e\//, /^scripts\//, /^\.github\//, /^\.claude\//, /^\.gitignore$/, /^\.gitattributes$/];

export const changesNeedBump = files => files.some(f => !NO_BUMP.some(re => re.test(f)));

export function isBumped(before, after) {
  if (!before) return true; // the first versioned commit
  const a = before.split('.').map(Number), b = after.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (b[i] !== a[i]) return b[i] > a[i];
  return false;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const git = cmd => execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
  const files = git('diff --name-only HEAD~1 HEAD').split('\n').filter(Boolean);
  const version = ref => { try { return JSON.parse(git(`show ${ref}:package.json`)).version; } catch { return null; } };
  const [before, after] = [version('HEAD~1'), version('HEAD')];
  if (!changesNeedBump(files)) console.log(`check-version: no app change (${files.length} files), version ${after}`);
  else if (isBumped(before, after)) console.log(`check-version: ${before ?? '(none)'} → ${after}`);
  else {
    console.error(`check-version: the app changed (${files.filter(f => changesNeedBump([f])).join(', ')}) but package.json's version is still ${after} (was ${before}). Bump it: patch for fixes, minor for features, major for big changes.`);
    process.exit(1);
  }
}
