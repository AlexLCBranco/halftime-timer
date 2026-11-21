// HT-3: the shared layout (backlogkit's NAV_PATTERN.md, section 6): the pinned header, the What chips, state in the URL.
// Each test gets a fresh browser context, so the timers it adds live only in that context's localStorage and vanish with it.
import { test, expect } from '@playwright/test';

const header = page => page.getByTestId('top-bar');
const chips = page => page.getByTestId('what-chip');
const chip = (page, name) => chips(page).filter({ hasText: name });
const label = page => page.locator('#label');

// adds a throwaway timer through the page's own form; it becomes the one on screen
async function addTimer(page, name, minutes) {
  await page.locator('#nameIn').fill(name);
  await page.locator('#minIn').fill(String(minutes));
  await page.locator('#addBtn').click();
  await expect(label(page)).toHaveText(name);
}
// total layout shift not caused by the user's own input, since the page loaded
const layoutShift = page => page.evaluate(() => new Promise(done => {
  let sum = 0;
  new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) sum += e.value; }).observe({ type: 'layout-shift', buffered: true });
  requestAnimationFrame(() => setTimeout(() => done(sum), 300));
}));

test('the header is there, keeps its height, and stays in view after scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto('/');
  for (const part of ['page-history', 'breadcrumb', 'go-anywhere', 'where-tabs']) await expect(header(page).getByTestId(part)).toBeVisible();
  const before = await header(page).boundingBox();
  expect(before.y).toBe(0);

  await addTimer(page, 'e2e Tea', 3); // another timer on screen: same header, same height
  expect((await header(page).boundingBox()).height).toBe(before.height);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
  const after = await header(page).boundingBox();
  expect(after.y).toBe(0);
  expect(after.height).toBe(before.height);
  await expect(page.getByTestId('where-timers')).toBeInViewport();
  // the What row is not pinned: it scrolls away with the page
  await expect(page.getByTestId('what-chips')).not.toBeInViewport();
});

test('What chips pick the timer; the URL round-trips through reload, back and forward', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\?timer=halftime$/);
  await addTimer(page, 'e2e Tea', 3);
  await addTimer(page, 'e2e Nap', 20);
  await expect(chips(page)).toHaveCount(3);
  await expect(chip(page, 'e2e Nap')).toHaveAttribute('aria-pressed', 'true');
  const napUrl = page.url();
  expect(napUrl).toMatch(/\?timer=\w+$/);

  await chip(page, 'e2e Tea').click();
  await expect(label(page)).toHaveText('e2e Tea');
  await expect(page.locator('#time')).toHaveText('03:00');
  await expect(chip(page, 'e2e Tea')).toHaveClass(/fk-chip-on/);
  const teaUrl = page.url();
  expect(teaUrl).not.toBe(napUrl);

  await page.reload(); // the same screen again
  await expect(label(page)).toHaveText('e2e Tea');
  await expect(page).toHaveURL(teaUrl);

  await page.goBack(); // the browser's own back / forward
  await expect(label(page)).toHaveText('e2e Nap');
  await expect(page).toHaveURL(napUrl);
  await page.goForward();
  await expect(label(page)).toHaveText('e2e Tea');

  // the header's back / forward do the same, and say where they lead
  const back = page.getByRole('button', { name: 'Back', exact: true }), forward = page.getByRole('button', { name: 'Forward', exact: true });
  await expect(back).toHaveAttribute('title', 'Back to e2e Nap');
  await expect(forward).toBeDisabled();
  await back.click();
  await expect(label(page)).toHaveText('e2e Nap');
  await expect(page).toHaveURL(napUrl);
  await expect(forward).toHaveAttribute('title', 'Forward to e2e Tea');
  await forward.click();
  await expect(label(page)).toHaveText('e2e Tea');
  await expect(page).toHaveURL(teaUrl);

  // a pasted link opens that timer
  await page.goto(napUrl);
  await expect(label(page)).toHaveText('e2e Nap');
});

test('the breadcrumb shows the path, and its timer part jumps to another timer', async ({ page }) => {
  await page.goto('/?timer=halftime');
  await addTimer(page, 'e2e Tea', 3);
  const parts = page.getByTestId('crumb-btn');
  await expect(parts).toHaveText(['Timers', 'e2e Tea']);
  await parts.last().click();
  const menu = page.getByTestId('crumb-menu');
  await expect(menu.getByRole('menuitem')).toHaveText(['Halftime', 'e2e Tea']);
  await expect(menu.getByRole('menuitem', { name: 'e2e Tea' })).toHaveAttribute('aria-current', 'true');
  await menu.getByRole('menuitem', { name: 'Halftime' }).click();
  await expect(menu).toHaveCount(0);
  await expect(label(page)).toHaveText('Halftime');
  await expect(page).toHaveURL(/\?timer=halftime$/);
  await expect(parts).toHaveText(['Timers', 'Halftime']);
  // Escape closes the list without going anywhere
  await parts.last().click();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(label(page)).toHaveText('Halftime');
});

test('the app has one place, Timers, always shown as the current one', async ({ page }) => {
  await page.goto('/');
  const tabs = page.getByTestId('where-tabs').getByRole('button');
  await expect(tabs).toHaveText(['Timers']);
  await expect(tabs.first()).toHaveAttribute('aria-current', 'page');
  await addTimer(page, 'e2e Tea', 3);
  const url = page.url();
  await tabs.first().click(); // already there: nothing changes
  await expect(page).toHaveURL(url);
  await expect(label(page)).toHaveText('e2e Tea');
  await expect(tabs.first()).toHaveAttribute('aria-current', 'page');
});

test('Go anywhere (Ctrl+K or the button) finds a timer by name and jumps to it', async ({ page }) => {
  await page.goto('/');
  await addTimer(page, 'e2e Tea', 3);
  await addTimer(page, 'e2e Nap', 20);
  await page.locator('body').click({ position: { x: 5, y: 300 } }); // focus out of the form
  await page.keyboard.press('Control+k');
  const dialog = page.getByTestId('go-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('go-input')).toBeFocused();
  await expect(page.getByTestId('go-item')).toHaveCount(3);
  await page.keyboard.type('tea');
  await expect(page.getByTestId('go-item')).toHaveText([/e2e Tea.*03:00/]);
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(label(page)).toHaveText('e2e Tea');
  await expect(page).toHaveURL(/\?timer=\w+$/);
  await expect(page.locator('#time')).toHaveText('03:00'); // typing in the search never started or reset the timer

  await page.getByTestId('go-anywhere').click(); // the button opens it too; a click picks
  await page.getByTestId('go-input').fill('zzz');
  await expect(dialog).toContainText('No timer is called "zzz"');
  await page.getByTestId('go-input').fill('half');
  await page.getByTestId('go-item').first().click();
  await expect(label(page)).toHaveText('Halftime');
  await page.getByTestId('go-anywhere').click();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('old addresses keep working: a bare address opens the timer used last', async ({ page }) => {
  await page.goto('/');
  await expect(label(page)).toHaveText('Halftime');
  await addTimer(page, 'e2e Tea', 3);
  await page.goto('/');
  await expect(label(page)).toHaveText('e2e Tea');
  await expect(page).toHaveURL(/\?timer=\w+$/);
  // a timer this browser doesn't know: the built-in one, not an error
  await page.goto('/?timer=nope');
  await expect(label(page)).toHaveText('Halftime');
  await expect(page).toHaveURL(/\?timer=halftime$/);
});

test('deleting the timer on screen goes back to Halftime', async ({ page }) => {
  await page.goto('/');
  await addTimer(page, 'e2e Tea', 3);
  await page.getByRole('button', { name: 'Delete e2e Tea' }).click();
  await expect(chips(page)).toHaveCount(1);
  await expect(label(page)).toHaveText('Halftime');
  await expect(page).toHaveURL(/\?timer=halftime$/);
});

test('picking a timer updates the screen in under 100 ms', async ({ page }) => {
  await page.goto('/');
  for (let i = 1; i <= 12; i++) await addTimer(page, `e2e Timer ${i}`, i); // the heaviest this page gets
  const ms = await page.evaluate(async () => {
    const first = document.querySelector('[data-testid="what-chip"]');
    const t0 = performance.now();
    first.click();
    if (document.getElementById('label').textContent !== 'Halftime') throw new Error('not updated');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); // painted
    return performance.now() - t0;
  });
  expect(ms).toBeLessThan(100);
});

test('nothing jumps: no layout shift on load or after picking a timer', async ({ page }) => {
  await page.goto('/');
  await addTimer(page, 'e2e Tea', 3);
  await addTimer(page, 'e2e A much longer timer name', 45);
  await page.reload();
  await expect(label(page)).toHaveText('e2e A much longer timer name');
  expect(await layoutShift(page)).toBeLessThan(0.01);
  // picking a chip makes it bold; its neighbours must not move
  await page.evaluate(() => window.scrollTo(0, 0));
  const before = await chip(page, 'e2e A much longer').boundingBox();
  await chip(page, 'e2e Tea').click();
  await expect(label(page)).toHaveText('e2e Tea');
  expect(await chip(page, 'e2e A much longer').boundingBox()).toEqual(before);
  await page.goBack();
  await expect(label(page)).toHaveText('e2e A much longer timer name');
  expect(await layoutShift(page)).toBeLessThan(0.01);
});

test('no dropdowns, and every icon-only control says what it is', async ({ page }) => {
  await page.goto('/');
  await addTimer(page, 'e2e Tea', 3);
  await expect(page.locator('select')).toHaveCount(0);
  const unnamed = await page.evaluate(() => [...document.querySelectorAll('button, [role="button"]')]
    .filter(b => !/[a-z]{2}/i.test(b.textContent)) // no words on it: an icon
    .filter(b => !(b.getAttribute('aria-label') || '').trim() || !(b.title || '').trim())
    .map(b => b.outerHTML.slice(0, 80)));
  expect(unnamed).toEqual([]);
});

test('at 390 px: the header fits, nothing is hidden in a menu, the page never scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  await addTimer(page, 'e2e A much longer timer name for a phone', 45);
  await addTimer(page, 'e2e Tea', 3);
  const fits = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await fits();
  const box = await header(page).boundingBox();
  expect(box.x).toBe(0);
  expect(box.width).toBe(390);
  // every control is inside the header and on screen
  for (const part of [page.getByRole('button', { name: 'Back', exact: true }), page.getByRole('button', { name: 'Forward', exact: true }),
    page.getByTestId('crumb-btn').last(), page.getByTestId('go-anywhere'), page.getByTestId('where-timers')]) {
    const b = await part.boundingBox();
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(390);
    expect(b.y + b.height).toBeLessThanOrEqual(box.height);
  }
  await expect(page.getByTestId('where-timers')).toContainText('Timers'); // the icon with its word under it
  await expect(page.locator('.fk-where-label')).toBeVisible();
  await expect(page.locator('.fk-go-text')).toBeHidden(); // search is an icon button here
  expect(await page.locator('[aria-label*="menu" i]:not([role="menu"]), .hamburger').count()).toBe(0);
  // a long name in the breadcrumb is cut short, not pushed off the screen
  await chip(page, 'e2e A much longer').click();
  await expect(label(page)).toHaveText('e2e A much longer timer name for a phone');
  await fits();
  const go = await page.getByTestId('go-anywhere').boundingBox();
  expect(go.x + go.width).toBeLessThanOrEqual(390);
  expect((await header(page).boundingBox()).height).toBe(box.height);
  await page.getByTestId('crumb-btn').last().click();
  const menu = await page.getByTestId('crumb-menu').boundingBox();
  expect(menu.x + menu.width).toBeLessThanOrEqual(390);
});

// Build report: SHOTS=<folder> saves a picture of the page (desktop and phone) for the owner to judge the looks.
test('screenshots for the build report', async ({ page }) => {
  test.skip(!process.env.SHOTS, 'set SHOTS=<folder> to save them');
  for (const [name, size] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 800 }]]) {
    await page.setViewportSize(size);
    await page.goto('/?timer=halftime');
    if (name === 'desktop') { await addTimer(page, 'Tea', 3); await addTimer(page, 'Nap', 20); await chip(page, 'Halftime').click(); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${process.env.SHOTS}/${name}.png` });
  }
});
