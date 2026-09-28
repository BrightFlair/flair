// Uses the optional browser tooling documented in docs/library.md.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
(async () => {
 const browser = await chromium.launch({executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  const page = await browser.newPage();
  await page.goto(`${base}/playground/?theme=github&scheme=system`);
  for(const mode of ['light', 'dark']) {
   const choice = page.locator(`.scheme-choice:has(input[value=${mode}])`);
   await choice.click();
   assert.equal(await page.locator('html').getAttribute('data-theme'), mode);
   await choice.click();
   assert.equal(await page.locator('html').getAttribute('data-theme'), null);
   assert.equal(await page.locator('input[type=radio]:checked').count(), 0);
  }
  await page.locator('.scheme-choice:has(input[value=light])').click();
  await page.locator('input[type=radio][value=light]').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.keyboard.press('Space');
  assert.equal(await page.locator('html').getAttribute('data-theme'), null);
  await page.reload();
  assert.equal(await page.locator('input[type=radio]:checked').count(), 0);
  for(const width of [320, 768, 1440]) {
   await page.setViewportSize({width, height: 900});
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
   const gaps = await page.locator('section-switcher form > label').evaluateAll(labels => labels.map(label => {
    const box = label.getBoundingClientRect(), span = label.querySelector('span').getBoundingClientRect(), select = label.querySelector('select').getBoundingClientRect();
    return [span.top - box.top, select.top - span.bottom];
   }));
   for(const [above, below] of gaps) assert.ok(above > 0 && Math.abs(above - below) < 1);
   const primary = await page.locator('input[name=primary]').boundingBox();
   const tint = await page.locator('input[name=tint]').boundingBox();
	   const sun = await page.locator('.scheme-choice:has(input[value=light])').boundingBox();
	   const moon = await page.locator('.scheme-choice:has(input[value=dark])').boundingBox();
   assert.ok(primary.width > tint.width);
   assert.equal(primary.width, primary.height);
   assert.equal(tint.width, tint.height);
	   assert.deepEqual({width: sun.width, height: sun.height}, {width: primary.width, height: primary.height});
	   assert.deepEqual({width: moon.width, height: moon.height}, {width: primary.width, height: primary.height});
  }
  const context = await browser.newContext({javaScriptEnabled: false});
  const native = await context.newPage();
  await native.goto(`${base}/playground/?scheme=system`);
  await native.locator('.scheme-choice:has(input[value=dark])').click();
  await Promise.all([native.waitForURL('**/*scheme=dark*'), native.getByRole('button', {name: 'Apply'}).click()]);
  assert.equal(await native.locator('html').getAttribute('data-theme'), 'dark');
  console.log('Passed switcher layout, pointer/keyboard system reset, persistence and native form submission.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
