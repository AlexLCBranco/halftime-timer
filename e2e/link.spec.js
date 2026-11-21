// HT-1: opening ?end=<ISO date-time with offset>&name=<text> adds and shows that countdown.
// Each test gets a fresh browser context, so its timers live only in that context's localStorage and vanish with it.
import { test, expect } from '@playwright/test';

// an ISO date-time with an explicit +02:00 offset, `ms` from now, rounded to the minute
function isoWithOffset(ms) {
  const t = new Date(Math.round((Date.now() + ms) / 60000) * 60000);
  const shifted = new Date(t.getTime() + 2 * 3600000);
  return { iso: shifted.toISOString().slice(0, 19) + '+02:00', at: t.getTime() };
}
const link = (end, name) => `/?end=${encodeURIComponent(end)}&name=${encodeURIComponent(name)}`;
const items = page => page.locator('#timerList .fk-chip-btn');

test('a link adds the named countdown and shows it at once', async ({ page }) => {
  const name = `e2e BOS @ DET ${Date.now()}`;
  const { iso, at } = isoWithOffset(2 * 3600000);
  await page.goto(link(iso, name));

  await expect(page.locator('#label')).toHaveText(name);
  await expect(items(page).filter({ hasText: name })).toHaveClass(/fk-chip-on/);
  await expect(items(page).filter({ hasText: 'Halftime' })).toHaveCount(1); // existing timers stay
  // counting down towards the linked moment (±1 min of rounding)
  const shown = await page.locator('#time').textContent();
  const [h, m] = shown.split(':').map(Number);
  expect(Math.abs(h * 60 + m - (at - Date.now()) / 60000)).toBeLessThan(2);
  const first = shown;
  await expect(page.locator('#time')).not.toHaveText(first, { timeout: 3000 }); // it's running
  await expect(page).toHaveURL(/\?end=[^&]+&name=/); // HT-3: the timer on screen stays in the address
  await page.reload(); // so a reload shows it again, still as one timer
  await expect(page.locator('#label')).toHaveText(name);
  await expect(items(page).filter({ hasText: name })).toHaveCount(1);
});

test('after a link, the Pop out button is highlighted until clicked once', async ({ page }) => {
  // headless Chromium has no Document Picture-in-Picture; a stub that refuses the window is enough here
  await page.addInitScript(() => { window.documentPictureInPicture = { requestWindow: () => Promise.reject(new Error('stub')) }; });
  const { iso } = isoWithOffset(3600000);
  await page.goto(link(iso, `e2e pop ${Date.now()}`));
  await expect(page.locator('#popBtn')).toHaveClass(/attn/);
  await page.locator('#popBtn').click();
  await expect(page.locator('#popBtn')).not.toHaveClass(/attn/);
  await page.goto('/'); // a plain visit doesn't highlight it
  await expect(page.locator('#popBtn')).not.toHaveClass(/attn/);
});

test('opening the same link twice keeps one timer', async ({ page }) => {
  const name = `e2e twice ${Date.now()}`;
  const { iso } = isoWithOffset(3 * 3600000);
  await page.goto(link(iso, name));
  await page.goto(link(iso, name));
  await expect(items(page).filter({ hasText: name })).toHaveCount(1);
  await expect(page.locator('#label')).toHaveText(name);
});

test('a time already in the past shows 0 and a note, never a negative countdown', async ({ page }) => {
  const name = `e2e past ${Date.now()}`;
  const { iso } = isoWithOffset(-3600000);
  await page.goto(link(iso, name));
  await expect(page.locator('#label')).toHaveText(name);
  await expect(page.locator('#time')).toHaveText('00:00');
  await expect(page.locator('#ends')).toContainText('already ended');
  await page.locator('#playBtn').click(); // starting it does nothing
  await page.waitForTimeout(1500);
  await expect(page.locator('#time')).toHaveText('00:00');
  await page.reload();
  await expect(page.locator('#time')).toHaveText('00:00');
});
