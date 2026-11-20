// The site's version shows in the bottom-right corner and matches the no-cache /version.json.
import { test, expect } from '@playwright/test';

test('the version label matches /version.json', async ({ page, request }) => {
  const res = await request.get('/version.json');
  expect(res.ok()).toBe(true);
  expect(res.headers()['cache-control']).toContain('no-cache');
  const info = await res.json();
  expect(info.version).toMatch(/^\d+\.\d+\.\d+$/);

  await page.goto('/');
  const label = page.locator('#siteVersion');
  await expect(label).toHaveText(`v${info.version}`);
  expect(await label.getAttribute('title')).toMatch(new RegExp('^' + RegExp.escape(`Version ${info.version} · commit ${info.commit}, built `)));
  // small, in the bottom-right corner
  const box = await label.boundingBox(), vp = page.viewportSize();
  expect(vp.width - (box.x + box.width)).toBeLessThan(20);
  expect(vp.height - (box.y + box.height)).toBeLessThan(20);
  // covers nothing: the last thing on the page ends above it
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const [h, l] = await Promise.all([page.locator('main > p.hint').last().boundingBox(), label.boundingBox()]);
  expect(h.y + h.height <= l.y || h.x + h.width <= l.x).toBe(true);
});
