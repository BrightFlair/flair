// Optional browser regression checks; setup is documented in docs/library.md.
const {chromium} = require('playwright');
const sass = require('sass');
const assert = require('node:assert/strict');
const path = require('node:path');
const css = sass.compileString(`
@use "flair" with ($icon-names: (chevron-right));
@use "theme";
:root { @include theme.base; }
:root[data-flair-theme=bright] { @include theme.bright; }
@include flair.base;
@include flair.controls;
@include flair.icon;
body { padding: 2rem; background: var(--theme-color-page); color: var(--theme-color-text); }
.control { @extend %o-button; }
.segments { @extend %p-segmented-control; }
.menu { @extend %o-disclosure-menu; }
.toggle { @extend %o-toggle-badge; }
`, {loadPaths: [path.resolve(__dirname, '../style')]}).css;
const markup = `<button id="button">Button</button><select id="select"><option>Select</option></select>
<div class="segments"><button>30 days</button><button>7 days</button><button>Today</button>
<div class="segment-menu"><details class="menu disclosure-menu"><summary class="control">Custom</summary></details></div></div>
<label class="toggle"><input type="checkbox"><span>Successful</span></label>
<a class="control" data-icon="chevron-right" data-icon-right href="#next">Next</a>`;
(async () => {
 const browser = await chromium.launch({executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}});
  const page = await context.newPage();
  for(const theme of ['base', 'bright']) for(const scheme of ['light', 'dark']) {
   await page.emulateMedia({colorScheme: scheme});
   await page.setContent(`<html data-flair-theme="${theme}"><style>${css}</style><body>${markup}</body></html>`);
   const expected = await page.evaluate(() => {
    const sample = document.createElement('span');
    sample.style.color = 'var(--theme-focus-color, var(--theme-color-accent))';
    document.body.append(sample);
    const colour = getComputedStyle(sample).color;
    sample.remove();
    return colour;
   });
   for(const selector of ['#button', '#select', '.segments > button', '.segments summary']) {
    const control = page.locator(selector).first();
    await control.focus();
    assert.equal(await control.evaluate(e => getComputedStyle(e).outlineColor), expected, `${theme}/${scheme}: focus colour must already be correct in the first frame`);
    await page.waitForTimeout(150);
    assert.ok(await control.evaluate(e => parseFloat(getComputedStyle(e).outlineWidth) > 0), `${selector}: focused outline`);
    await control.evaluate(e => e.blur());
    await control.hover();
    await page.mouse.down();
    await page.waitForTimeout(150);
    assert.equal(await control.evaluate(e => getComputedStyle(e).outlineColor), expected);
    assert.ok(await control.evaluate(e => parseFloat(getComputedStyle(e).outlineWidth) > 0), `${selector}: pressed outline`);
    await page.mouse.up();
    await page.keyboard.press('Escape');
   }
   for(const segment of await page.locator('.segments button, .segments summary').all()) {
    for(const state of ['rest', 'hover', 'press']) {
     await page.mouse.move(0, 0);
     if(state !== 'rest') await segment.hover();
     if(state === 'press') await page.mouse.down();
     assert.equal(await segment.evaluate(e => getComputedStyle(e).boxShadow), 'none', `${theme}/${scheme}/${state}: segments have no button shadows`);
     if(state === 'press') await page.mouse.up();
    }
   }
   const toggle = page.locator('.toggle');
   await page.mouse.move(0, 0);
   const resting = await toggle.evaluate(e => getComputedStyle(e).backgroundColor);
   await toggle.hover();
   assert.notEqual(await toggle.evaluate(e => getComputedStyle(e).backgroundColor), resting, 'Badge hover changes the surface subtly');
   if(theme === 'bright') assert.ok((await toggle.boundingBox()).height < 34, 'Bright badge retains its compact size');
   const next = page.locator('[data-icon-right]');
   assert.equal(await next.evaluate(e => getComputedStyle(e, '::before').content), 'none');
   assert.ok(await next.evaluate(e => getComputedStyle(e, '::after').maskImage.includes('chevron-right.svg')), 'Right icon renders after the words');
   console.log(`Passed control focus, press, segmented shadows, badges and trailing icons: ${theme}/${scheme}`);
  }
 } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
