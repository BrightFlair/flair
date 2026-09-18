// Optional browser tools: see docs/library.md.
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const base = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
const themes = ['base', 'ink', 'paper', 'vivid', 'github', 'material'];
const routes = ['library/navigation', 'playground/documentation-website', 'playground/dashboard-app', 'playground/github-clone'];
(async () => {
 const browser = await chromium.launch({executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  const context = await browser.newContext({viewport: {width: 320, height: 640}, hasTouch: true, reducedMotion: 'reduce'});
  const page = await context.newPage();
  for(const theme of themes) for(const scheme of ['light', 'dark']) {
   for(const route of routes) {
    await page.setViewportSize({width: 320, height: 640});
    await page.goto(`${base}/${route}/?theme=${theme}&scheme=${scheme}`);
    const toggle = page.locator('[data-navigation-toggle]');
    const links = page.locator(`#${await toggle.getAttribute('aria-controls')}`);
    assert.ok(await toggle.isVisible(), `${route}: mobile button`);
    assert.ok(!await links.isVisible(), `${route}: initially collapsed`);
    await toggle.tap();
    assert.ok(await links.isVisible());
    await links.locator('a').first().focus();
    await page.keyboard.press('Escape');
    assert.ok(!await links.isVisible());
    assert.ok(await toggle.evaluate(el => el === document.activeElement));
    await toggle.tap();
    assert.ok(await links.locator('a').first().evaluate(el => el.getBoundingClientRect().height >= 44));
    const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v => ({id:v.id, nodes:v.nodes.map(n=>n.target)})), [], `${theme}/${scheme}/${route}`);
    await toggle.tap();
    await page.setViewportSize({width: 1280, height: 900});
    assert.ok(!await toggle.isVisible());
    assert.ok(await links.isVisible(), 'wide navigation remains visible when mobile state is closed');
    await links.locator('a').first().focus();
    await page.setViewportSize({width: 320, height: 640});
    await page.waitForFunction(() => document.querySelector('[data-navigation-toggle]').getAttribute('aria-expanded') === 'true');
    assert.ok(await links.isVisible(), 'resizing preserves the focused link');
    assert.ok(await links.locator('a').first().evaluate(el=>el===document.activeElement));
    await page.keyboard.press('Escape');
    assert.ok(!await links.isVisible());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
   }
   await page.goto(`${base}/library/disclosures/?theme=${theme}&scheme=${scheme}`);
   const open = page.locator('#dialog-form [data-dialog-open]');
   await open.click();
   const dialog = page.locator('#dialog-form dialog');
   const bounds = await dialog.boundingBox();
   assert.equal(bounds.width, 320);
   assert.equal(bounds.height, 640);
   assert.equal(bounds.x, 0);
   assert.equal(bounds.y, 0);
   assert.ok(await dialog.locator('button[value="submit"]').evaluate(el=>el.getBoundingClientRect().height >= 44));
   assert.ok(await dialog.locator('input').evaluate(el=>el.getBoundingClientRect().height >= 44));
   const actions = dialog.locator('.actions');
   assert.equal(await actions.evaluate(el=>getComputedStyle(el).flexDirection), 'column');
   await dialog.locator('button[value="submit"]').click();
   assert.ok(await dialog.evaluate(el => el.matches(':modal')), 'required input prevents submission');
   const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(axe.violations.map(v=>v.id), [], `${theme}/${scheme}/modal`);
   await page.setViewportSize({width: 320, height: 240});
   assert.ok(await dialog.evaluate(el=>el.scrollHeight > el.clientHeight), 'short viewport scrolls inside dialog');
   await dialog.locator('input').fill('Mobile example');
   await dialog.locator('button[value="submit"]').click();
   assert.ok(!await dialog.isVisible());
   assert.ok(await open.evaluate(el=>el===document.activeElement));
   await page.setViewportSize({width: 1280, height: 900});
   await open.click();
   const wide = await dialog.boundingBox();
   assert.ok(wide.width < 1280 && wide.x > 0 && wide.height < 900);
   const contentHeight = await dialog.evaluate(el => {
    const style = getComputedStyle(el);
    const child = el.firstElementChild;
    const childStyle = getComputedStyle(child);
    return child.getBoundingClientRect().height + ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((sum, key) => sum + parseFloat(style[key]), 0) + parseFloat(childStyle.marginTop) + parseFloat(childStyle.marginBottom);
   });
   assert.ok(Math.abs(wide.height - contentHeight) <= 2, 'desktop dialog fits its content instead of stretching between viewport insets');
   assert.equal(await actions.evaluate(el=>getComputedStyle(el).flexDirection), 'row');
   await page.keyboard.press('Escape');
   console.log(`Passed mobile navigation and dialogs: ${theme}/${scheme}`);
  }
  const noJs = await browser.newContext({javaScriptEnabled: false, viewport:{width:320,height:640}});
  const fallback = await noJs.newPage();
  for(const route of routes) {
   await fallback.goto(`${base}/${route}/`);
   const button = fallback.locator('[data-navigation-toggle]');
   assert.ok(!await button.isVisible());
   assert.ok(await fallback.locator(`#${await button.getAttribute('aria-controls')}`).isVisible());
  }
  await fallback.goto(`${base}/library/disclosures/`);
  assert.ok(await fallback.locator('#dialog-form dialog').isVisible());
  assert.equal(await fallback.locator('#dialog-form dialog').evaluate(el=>getComputedStyle(el).position), 'static');
  const sass = require('sass');
  const path = require('node:path');
  const css = sass.compileString('@use "flair"; html { @include flair.defaults; } nav { @extend %p-side-navigation; @include flair.collapsible-navigation; }', {loadPaths:[path.resolve(__dirname, '../style')]}).css;
  await fallback.setContent(`<style>${css}</style><nav aria-label="Sections"><button hidden aria-expanded="false" aria-controls="links">Menu</button><ul id="links"><li><a href="#content">Content</a></li></ul></nav>`);
  assert.ok(!await fallback.locator('button').isVisible(), 'standalone consumer needs no reset to hide the enhancement button');
  assert.ok(await fallback.locator('a').isVisible());
  console.log('Passed mobile no-JavaScript navigation, standalone consumer and inline dialogs.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
