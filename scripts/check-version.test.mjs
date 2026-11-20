import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changesNeedBump, isBumped } from './check-version.mjs';

test('app files need a bump; docs, tests and tooling do not', () => {
  assert.equal(changesNeedBump(['index.html']), true);
  assert.equal(changesNeedBump(['vercel.json', 'README.md']), true);
  assert.equal(changesNeedBump(['BUILT.md', 'e2e/link.spec.js', 'scripts/build.mjs', '.github/workflows/ci.yml']), false);
});

test('only a higher MAJOR.MINOR.PATCH counts as a bump', () => {
  assert.equal(isBumped('1.0.0', '1.0.1'), true);
  assert.equal(isBumped('1.0.9', '1.1.0'), true);
  assert.equal(isBumped('1.2.0', '2.0.0'), true);
  assert.equal(isBumped('1.0.0', '1.0.0'), false);
  assert.equal(isBumped('1.1.0', '1.0.5'), false);
  assert.equal(isBumped('1.0.10', '1.0.9'), false);
  assert.equal(isBumped(null, '1.0.0'), true);
});
