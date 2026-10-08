// Optional browser tools use the same setup as browser-check.cjs.
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const base = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
const routes = ['documentation-website', 'dashboard-app', 'github-clone'];
const themes = ['base', 'bright', 'github', 'clean', 'gt'];
async function openTools(page) {
 const details = page.locator('.playground-theme-controls');
 if(await details.count() && !await details.evaluate(e => e.open)) await details.locator('summary').click();
}

(async () => {
 const browser = await chromium.launch({executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for(const width of [320, 1440]) {
   await page.setViewportSize({width, height: 1000});
   const response = await page.goto(`${base}/playground/?theme=base&scheme=light`);
   assert.equal(response.status(), 200);
   assert.ok(await page.locator('section-switcher').isVisible());
   assert.equal(await page.locator('select[name=section]').inputValue(), 'playground');
   assert.equal(await page.locator('.playground-close').count(), 0);
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `playground index ${width}: overflow`);
   const switcherBox = await page.locator('section-switcher').boundingBox();
   const headingBox = await page.getByRole('heading', {name: 'Playground'}).boundingBox();
   assert.ok(headingBox.y >= switcherBox.y + switcherBox.height, `playground index ${width}: controls must not cover the heading`);
  }
  const indexResult = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(indexResult.violations.map(item => ({id:item.id, targets:item.nodes.map(node=>node.target)})), [], 'playground index');
  await page.goto(`${base}/playground/?theme=base&scheme=light`);
  assert.equal(await page.locator('html').getAttribute('data-flair-theme'), 'base');
  assert.equal(await page.locator('select[name=theme]').inputValue(), 'base');
  assert.equal(await page.locator('select[name=theme] option[value=base]').count(), 1);
  assert.equal(await page.locator('select[name=theme] option[value=base]').textContent(), 'Monochrome');
  for(const route of [...routes, 'blank', 'settings-pages']) {
   await page.goto(`${base}/playground/${route}/?theme=base&scheme=light`);
   assert.equal(await page.locator('section-switcher').count(), 0, `${route}: global controls are removed`);
   const close = page.getByRole('link', {name: 'Exit example'});
   assert.ok(await close.isVisible(), `${route}: exit banner is visible`);
   assert.equal(await close.getAttribute('href'), '/playground/');
   assert.equal(await page.locator('.playground-bar').evaluate(element => getComputedStyle(element).position), 'sticky');
   assert.equal(await page.locator('main playground-tools').count(), 0, `${route}: controls are outside the example`);
   assert.equal(await page.locator('.playground-bar playground-tools').count(), 1, `${route}: one shared control set`);
   assert.equal(await page.getByRole('link', {name: 'All examples'}).count(), 0);
  }
  await Promise.all([
   page.waitForURL(url => url.pathname === '/playground/'),
	 page.getByRole('link', {name: 'Exit example'}).click(),
  ]);
  assert.ok(await page.locator('section-switcher').isVisible());
  console.log('Passed playground index controls and example exit navigation.');
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
       if(theme !== 'gt') assert.notEqual(hover, selected, `${route} ${theme}: hover and selection are distinct`);
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
   await openTools(page);
   await page.locator('select[name=theme]').selectOption('base');
   assert.equal(await page.locator('html').getAttribute('data-flair-theme'), 'base');
   await page.reload();
   assert.equal(await page.locator('html').getAttribute('data-flair-theme'), 'base');
  }
  await page.goto(`${base}/playground/dashboard-app/?theme=clean&scheme=light`);
  await page.setViewportSize({width: 1440, height: 1000});
  for(const scheme of ['light', 'dark']) {
   for(const view of ['appearance', 'integrations']) {
    for(const width of [320, 375, 768, 1440]) {
     await page.setViewportSize({width, height: 1000});
     const response = await page.goto(`${base}/playground/settings-pages/?theme=clean&scheme=${scheme}&width=${width}#${view}`);
     assert.equal(response.status(), 200);
     assert.equal(await page.locator('.settings-pages').getAttribute('data-settings-current'), view);
     assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${scheme} ${view} ${width}: settings overflow`);
    }
    const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(result.violations.map(item => ({id:item.id, targets:item.nodes.map(node=>node.target)})), [], `${scheme} ${view}`);
   }
  }
  await page.setViewportSize({width: 375, height: 1000});
  await page.goto(`${base}/playground/settings-pages/?theme=clean&scheme=light#appearance`);
  await page.locator('[data-settings-view-select]').selectOption('integrations');
  await page.waitForFunction(() => document.querySelector('.settings-pages').dataset.settingsCurrent === 'integrations');
  assert.ok(await page.locator('[data-settings-view="integrations"]').isVisible());
  await page.locator('[data-settings-menu-toggle]').click();
  assert.ok(await page.locator('#settings-sidebar').isVisible());
  assert.equal(await page.locator('[data-settings-menu-toggle]').getAttribute('aria-expanded'), 'true');
  console.log('Passed responsive settings views, light/dark accessibility and navigation.');
  await page.goto(`${base}/playground/github-clone/?theme=bright`);
   await openTools(page);
   await page.locator('select[name=theme]').selectOption('github');
   if(await page.locator('.playground-theme-controls').count()) await page.locator('.playground-theme-controls > summary').click();
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
   await openTools(page);
   await page.locator('select[name=theme]').selectOption('bright');
   await page.locator('.playground-theme-controls > summary').click();
  assert.notEqual((await presentation(sidebarCurrent)).background, 'rgb(246, 248, 250)', 'Switching to Bright changes the selected surface');
  await page.goto(`${base}/playground/github-clone/?theme=base`);
  await page.locator('#properties > summary').click();
  assert.ok(await page.locator('#properties').evaluate(e => e.open));
  await page.locator('input[name=title]').fill('Edited example');
  await Promise.all([page.waitForURL('**/*title=Edited*'), page.getByRole('button', {name:'Save example'}).click()]);
  assert.equal(new URL(page.url()).searchParams.get('title'), 'Edited example');
  const presetTints = {base:'#111111', bright:'#9e77ed', github:'#0969da', clean:'#204698', gt:'#336699'};
  const presetPrimaryColours = {base:'#111111', bright:'#c328d1', github:'#1f883d', clean:'#204698', gt:'#4f5b93'};
  for(const [theme, tint] of Object.entries(presetTints)) {
   const primary = presetPrimaryColours[theme];
   await page.goto(`${base}/playground/?theme=${theme}&scheme=light&tint=%23123456&primary=%23654321`);
   assert.equal(await page.locator('input[name=tint]').inputValue(), '#123456');
   assert.equal(await page.locator('input[name=tint]').getAttribute('data-custom'), 'true');
   assert.equal(await page.locator('input[name=primary]').inputValue(), '#654321');
   assert.equal(await page.locator('input[name=primary]').getAttribute('data-custom'), 'true');
   assert.deepEqual(await page.locator('html').evaluate(element => {
    const style = getComputedStyle(element);
    return {
     tint: style.getPropertyValue('--theme-color-tint').trim(),
     accent: style.getPropertyValue('--theme-color-accent').trim(),
     primary: style.getPropertyValue('--theme-color-primary').trim(),
    };
   }), {tint: '#123456', accent: '#123456', primary: '#654321'}, `${theme}: custom colours reach their semantic tokens`);
   await page.goto(`${base}/playground/?theme=${theme}&scheme=light&tint=invalid&primary=invalid`);
   assert.equal(await page.locator('input[name=tint]').inputValue(), tint);
   assert.equal(await page.locator('input[name=tint]').getAttribute('data-custom'), 'false');
   assert.equal(await page.locator('input[name=primary]').inputValue(), primary);
   assert.equal(await page.locator('input[name=primary]').getAttribute('data-custom'), 'false');
  }
  await page.goto(`${base}/playground/?theme=base&scheme=light&tint=invalid&primary=invalid`);
  const tintInput = page.locator('input[name=tint]');
  const primaryInput = page.locator('input[name=primary]');
  await tintInput.fill('#e11d48');
  await primaryInput.fill('#16a34a');
   await openTools(page);
   await page.locator('select[name=theme]').selectOption('github');
   if(await page.locator('.playground-theme-controls').count()) await page.locator('.playground-theme-controls > summary').click();
  assert.equal(await tintInput.inputValue(), '#0969da');
  assert.equal(await primaryInput.inputValue(), '#1f883d');
  assert.equal(await page.locator('html').evaluate(element => element.style.getPropertyValue('--theme-color-tint')), '');
  assert.equal(await page.locator('html').evaluate(element => element.style.getPropertyValue('--theme-color-primary')), '');
  await tintInput.fill('#e11d48');
  await primaryInput.fill('#16a34a');
  assert.equal(await page.evaluate(() => {
   const sample = document.createElement('span');
   sample.style.color = 'var(--theme-color-accent)';
   document.body.append(sample);
   const colour = getComputedStyle(sample).color;
   sample.remove();
   return colour;
  }), 'rgb(225, 29, 72)');
  await page.reload();
  assert.equal(await tintInput.inputValue(), '#e11d48');
  assert.equal(await primaryInput.inputValue(), '#16a34a');
  assert.equal(await page.locator('html').getAttribute('style'), '--theme-color-tint: #e11d48; --theme-color-primary: #16a34a;');
  await page.goto(`${base}/playground/github-clone/`);
  const customPrimaryButton = page.locator('#editor form > button[type="submit"]');
  assert.equal(await customPrimaryButton.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(22, 163, 74)');
  await customPrimaryButton.focus();
  assert.equal(await customPrimaryButton.evaluate(element => getComputedStyle(element).outlineColor), 'rgb(225, 29, 72)');
  console.log('Passed CSS-derived defaults, theme resets, validation and persistent custom colours.');
  const context = await browser.newContext({javaScriptEnabled:false});
  const nojs = await context.newPage();
  await nojs.goto(`${base}/playground/dashboard-app/`);
  await openTools(nojs);
  await nojs.locator('select[name=theme]').selectOption('github');
	  await nojs.locator('input[name=tint]').fill('#123456');
	  await nojs.locator('input[name=primary]').fill('#654321');
  await Promise.all([nojs.waitForURL(url => url.searchParams.get('theme') === 'github'), nojs.getByRole('button', {name:'Apply'}).click()]);
  assert.equal(await nojs.locator('html').getAttribute('data-flair-theme'), 'github');
  assert.equal(new URL(nojs.url()).searchParams.get('tint'), '#123456');
	  assert.equal(new URL(nojs.url()).searchParams.get('primary'), '#654321');
	  assert.equal(await nojs.locator('html').getAttribute('style'), '--theme-color-tint: #123456; --theme-color-primary: #654321');
	  const presetContext = await browser.newContext({javaScriptEnabled:false});
	  const presetPage = await presetContext.newPage();
	  await presetPage.goto(`${base}/playground/dashboard-app/?theme=github&scheme=light`);
	  await openTools(presetPage);
	  await presetPage.locator('select[name=scheme]').selectOption('dark');
	  await Promise.all([presetPage.waitForURL(url => url.searchParams.get('scheme') === 'dark'), presetPage.getByRole('button', {name:'Apply'}).click()]);
	  assert.equal(await presetPage.locator('html').getAttribute('style'), null);
	  assert.equal(await presetPage.locator('input[name=tint]').inputValue(), '#4493f8');
	  assert.equal(await presetPage.locator('input[name=tint]').getAttribute('data-custom'), 'false');
	  assert.equal(await presetPage.locator('input[name=primary]').inputValue(), '#3fb950');
	  assert.equal(await presetPage.locator('input[name=primary]').getAttribute('data-custom'), 'false');
	  await presetContext.close();
  assert.deepEqual(errors, []);
  console.log('Passed theme persistence, native disclosure/form and no-JavaScript theme switching.');
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
