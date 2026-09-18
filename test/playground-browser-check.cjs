// Optional browser tools use the same setup as browser-check.cjs.
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const base = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
const routes = ['documentation-website', 'dashboard-app', 'github-clone'];
const themes = ['base', 'ink', 'paper', 'vivid', 'github', 'material'];
(async () => {
 const browser = await chromium.launch({executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for(const route of routes) {
   for(const theme of themes) {
    for(const width of [320, 768, 1440, 1920]) {
     await page.setViewportSize({width, height: 1000});
     const response = await page.goto(`${base}/playground/${route}/?theme=${theme}`);
     assert.equal(response.status(), 200);
     await page.evaluate(() => document.fonts.ready);
     assert.equal(await page.locator('html').getAttribute('data-flair-theme'), theme);
     assert.equal(await page.locator('select[name=theme]').inputValue(), theme);
     assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} ${theme} ${width}: overflow`);
     if(width === 1920) {
      const box = await page.locator('main').boundingBox();
      if(route === 'documentation-website') {
       assert.ok(box.x > 0 && Math.abs(box.x - (width - box.width) / 2) < 1);
       const sidebar = page.locator('main > aside');
       const sideBox = await sidebar.boundingBox();
       const compareSurface = async () => {
        const edge = await page.screenshot({clip: {x: 1, y: 10, width: 2, height: 2}});
        const surface = await page.screenshot({clip: {x: Math.ceil(sideBox.x) + 1, y: 10, width: 2, height: 2}});
        assert.ok(edge.equals(surface), `${theme}: sidebar background should reach the left viewport edge`);
       };
       await compareSurface();
       await page.evaluate(() => window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'}));
       await compareSurface();
       await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
      }
      else assert.ok(box.x === 0 && box.width === width);
     }
     if(width === 320 && route === 'documentation-website') {
      assert.equal(await page.locator('main > aside').evaluate(e => getComputedStyle(e).boxShadow), 'none');
     }
     if(width === 1440 && route === 'documentation-website' && theme === 'github') {
      const lines = await page.locator('aside > nav a[href="#structure"]').evaluate(element => {
       const range = document.createRange();
       range.selectNodeContents(element);
       return Array.from(range.getClientRects(), rect => ({left: rect.left, top: rect.top}));
      });
      assert.ok(lines.length > 1, 'The long sidebar label should wrap in this fixture');
      assert.ok(lines.every(line => Math.abs(line.left - lines[0].left) < 1), 'Wrapped sidebar text must align with its first line');
     }
     if(width === 1440) {
      if(route !== 'github-clone') {
       const sidebar = page.locator('main > aside');
       const current = sidebar.locator(':scope > nav a[aria-current]');
       const link = sidebar.locator(':scope > nav a:not([aria-current])').first();
       const background = locator => locator.evaluate(e => getComputedStyle(e).backgroundColor);
       const surface = await background(sidebar);
       assert.equal(await background(link), 'rgba(0, 0, 0, 0)', `${route} ${theme}: resting link should reveal its sidebar surface`);
       const selected = await background(current);
       assert.notEqual(selected, surface, `${route} ${theme}: current item must remain visible`);
       await link.hover();
       const hover = await background(link);
       assert.notEqual(hover, surface, `${route} ${theme}: hover must differ from the sidebar`);
       assert.notEqual(hover, selected, `${route} ${theme}: hover and selection are distinct`);
       await page.mouse.move(0, 0);
       await page.keyboard.press('Tab');
       await link.focus();
       assert.equal(await background(link), hover, `${route} ${theme}: matching keyboard focus treatment`);
       assert.notEqual(await link.evaluate(e => getComputedStyle(e).outlineStyle), 'none');
       await link.evaluate(e => e.blur());
       await current.hover();
       assert.equal(await background(current), selected, `${route} ${theme}: selected hover keeps its contrast`);
       await page.mouse.move(0, 0);
      }
      const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(result.violations.map(v => ({id:v.id, nodes:v.nodes.map(n=>n.target)})), [], `${route} ${theme}`);
     }
    }
   }
   console.log(`Passed all themes, widths and accessibility: ${route}`);
   await page.locator('select[name=theme]').selectOption('ink');
   assert.equal(await page.locator('html').getAttribute('data-flair-theme'), 'ink');
   await page.reload();
   assert.equal(await page.locator('html').getAttribute('data-flair-theme'), 'ink');
  }
  await page.goto(`${base}/playground/github-clone/?theme=vivid`);
  await page.locator('select[name=theme]').selectOption('github');
  const sidebarCurrent = page.locator('aside nav a[aria-current]');
  const tabsCurrent = page.locator('main > header nav a[aria-current]');
  const waitBackground = async (locator, color) => page.waitForFunction(({element, color}) => getComputedStyle(element).backgroundColor === color, {element: await locator.elementHandle(), color});
  await waitBackground(tabsCurrent, 'rgba(0, 0, 0, 0)');
  const weight = locator => locator.evaluate(e => getComputedStyle(e).fontWeight);
  assert.equal(await weight(tabsCurrent), await weight(page.locator('main > header nav a').nth(1)));
  assert.equal(await weight(sidebarCurrent), '700');
  const presentation = locator => locator.evaluate(e => ({background: getComputedStyle(e).backgroundColor, shadow: getComputedStyle(e).boxShadow}));
  assert.deepEqual(await presentation(sidebarCurrent), {background: 'rgb(246, 248, 250)', shadow: 'none'});
  assert.deepEqual(await presentation(tabsCurrent), {background: 'rgba(0, 0, 0, 0)', shadow: 'none'});
  assert.deepEqual(await tabsCurrent.evaluate(e => { const s = getComputedStyle(e.parentElement); return {width: s.borderBottomWidth, color: s.borderBottomColor, radius: s.borderBottomLeftRadius}; }), {width: '2px', color: 'rgb(253, 140, 115)', radius: '0px'});
  for(const link of [tabsCurrent, page.locator('main > header nav a').nth(1)]) {
   const inset = await link.evaluate(e => {
    const link = e.getBoundingClientRect(), item = e.parentElement.getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return {left: (link.left - item.left) / rem, right: (item.right - link.right) / rem,
     top: (link.top - item.top) / rem, bottom: (item.bottom - link.bottom - 2) / rem,
     padding: parseFloat(getComputedStyle(e).paddingInlineStart) / rem};
   });
   assert.deepEqual(inset, {left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, padding: 0.5});
   await link.hover();
   await waitBackground(link, 'rgb(216, 222, 228)');
   assert.equal((await presentation(link)).background, 'rgb(216, 222, 228)');
   await page.mouse.move(0, 0);
   await page.keyboard.press('Tab');
   await link.focus();
   await waitBackground(link, 'rgb(216, 222, 228)');
   assert.equal((await presentation(link)).background, 'rgb(216, 222, 228)');
   await link.evaluate(e => e.blur());
  }
  const disclosure = page.locator('#properties');
  const summary = disclosure.locator('summary');
  for(const open of [false, true]) {
   if(open) await summary.click();
   await page.mouse.move(0, 0);
   const background = (await presentation(summary)).background;
   assert.equal(await weight(summary), '700');
   await summary.hover();
   assert.equal((await presentation(summary)).background, background);
   assert.equal(await disclosure.evaluate(e => e.open), open);
  }
  await page.locator('select[name=theme]').selectOption('vivid');
  assert.equal((await presentation(sidebarCurrent)).background, 'rgb(199, 255, 84)');
  await page.goto(`${base}/playground/github-clone/?theme=base`);
  await page.locator('#properties > summary').click();
  assert.ok(await page.locator('#properties').evaluate(e => e.open));
  await page.locator('input[name=title]').fill('Edited example');
  await Promise.all([page.waitForURL('**/*title=Edited*'), page.getByRole('button', {name:'Save example'}).click()]);
  assert.equal(new URL(page.url()).searchParams.get('title'), 'Edited example');
  const context = await browser.newContext({javaScriptEnabled:false});
  const nojs = await context.newPage();
  await nojs.goto(`${base}/playground/dashboard-app/`);
  await nojs.locator('select[name=theme]').selectOption('github');
  await Promise.all([nojs.waitForURL(url => url.searchParams.get('theme') === 'github'), nojs.getByRole('button', {name:'Apply'}).click()]);
  assert.equal(await nojs.locator('html').getAttribute('data-flair-theme'), 'github');
  assert.deepEqual(errors, []);
  console.log('Passed theme persistence, native disclosure/form and no-JavaScript theme switching.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
