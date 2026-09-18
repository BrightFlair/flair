// Optional browser setup: see docs/library.md.
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const sass = require('sass');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
const themes = ['base', 'ink', 'paper', 'vivid', 'github', 'material'];
const routes = ['typography', 'controls', 'forms', 'surfaces', 'navigation', 'disclosures', 'tables', 'feedback', 'code', 'layouts'].map(x => `/library/${x}/`).concat(['documentation-website','dashboard-app','github-clone'].map(x => `/playground/${x}/`));
(async () => {
 const browser = await chromium.launch({executablePath:process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 try {
  // Test a consuming application with no demo attributes, cookies or JavaScript.
  const context = await browser.newContext({javaScriptEnabled:false, colorScheme:'light'});
  const page = await context.newPage();
  for(const theme of themes) {
   const css = sass.compileString(`@use "flair"; @use "theme"; html { @include theme.base; ${theme==='base'?'':`@include theme.${theme};`} background:var(--flair-color-surface); color:var(--flair-color-text); } button { @extend %o-button; }`, {loadPaths:[path.resolve('style')]}).css;
   await page.setContent(`<html lang="en"><title>Scheme test</title><style>${css}</style><body><button>Example</button></body></html>`);
   const background = () => page.locator('html').evaluate(e=>getComputedStyle(e).backgroundColor);
   const dimensions = () => page.locator('button').boundingBox();
   const colours = {};
   for(const system of ['light','dark']) {
    await page.emulateMedia({colorScheme:system});
    colours[system] = await background();
   }
   assert.notEqual(colours.light,colours.dark, `${theme}: two palettes required`);
   for(const system of ['light','dark']) {
    await page.emulateMedia({colorScheme:system});
    for(const explicit of ['light','dark']) {
     await page.locator('html').evaluate((e,value)=>e.dataset.theme=value,explicit);
     assert.equal(await background(),colours[explicit],`${theme}: ${explicit} must override ${system}`);
     assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).colorScheme),explicit);
    }
    await page.locator('html').evaluate(e=>e.removeAttribute('data-theme'));
    assert.equal(await background(),colours[system],`${theme}: removing override restores system`);
   }
   await page.emulateMedia({colorScheme:'light'});
   const lightBox = await dimensions();
   await page.emulateMedia({colorScheme:'dark'});
   assert.deepEqual(await dimensions(),lightBox,`${theme}: scheme must not change geometry`);
  }
  console.log('Passed standalone themes: light/dark overrides, live system preference, no JavaScript, unchanged geometry.');
  await context.close();

  const site = await browser.newContext({colorScheme:'dark'});
  const demo = await site.newPage();
  const errors=[];
  demo.on('pageerror',e=>errors.push(e.message));
  for(const theme of themes) {
   for(const route of routes) {
    await demo.setViewportSize({width:1440,height:1000});
    const response=await demo.goto(`${base}${route}?theme=${theme}&scheme=system`);
    assert.equal(response.status(),200,route);
    assert.equal(await demo.locator('html').getAttribute('data-theme'),null);
    assert.equal(await demo.locator('html').getAttribute('data-flair-theme'),theme);
    await demo.evaluate(()=>document.fonts.ready);
    const result=await new AxeBuilder({page:demo}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[],`${theme} ${route} dark accessibility`);
    for(const width of [320,1440]) {
     await demo.setViewportSize({width,height:1000});
     assert.ok(await demo.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${theme} ${route} ${width}: overflow`);
    }
   }
   console.log(`Passed dark pages and accessibility: ${theme}`);
  }
  await demo.goto(`${base}/playground/github-clone/?theme=github&scheme=system`);
  const bg=()=>demo.locator('html').evaluate(e=>getComputedStyle(e).backgroundColor);
  const dark=await bg();
  await demo.locator('select[name=scheme]').selectOption('light');
  assert.equal(await demo.locator('html').getAttribute('data-theme'),'light');
  assert.notEqual(await bg(),dark);
  await demo.reload();
  assert.equal(await demo.locator('html').getAttribute('data-theme'),'light');
  await demo.locator('select[name=theme]').selectOption('paper');
  assert.equal(await demo.locator('html').getAttribute('data-theme'),'light');
  await demo.locator('select[name=scheme]').selectOption('system');
  assert.equal(await demo.locator('html').getAttribute('data-theme'),null);
  await demo.reload();
  assert.equal(await demo.locator('html').getAttribute('data-theme'),null);
  const nojs=await browser.newContext({javaScriptEnabled:false,colorScheme:'light'});
  const staticPage=await nojs.newPage();
  await staticPage.goto(`${base}/playground/documentation-website/`);
  await staticPage.locator('select[name=scheme]').selectOption('dark');
  await Promise.all([staticPage.waitForURL('**/*scheme=dark'),staticPage.getByRole('button',{name:'Apply'}).click()]);
  assert.equal(await staticPage.locator('html').getAttribute('data-theme'),'dark');
  await staticPage.goto(`${base}/playground/dashboard-app/`);
  assert.equal(await staticPage.locator('html').getAttribute('data-theme'),'dark');
  await staticPage.locator('select[name=scheme]').selectOption('system');
  await Promise.all([staticPage.waitForURL('**/*scheme=system'),staticPage.getByRole('button',{name:'Apply'}).click()]);
  assert.equal(await staticPage.locator('html').getAttribute('data-theme'),null);
  assert.deepEqual(errors,[]);
  console.log('Passed independent theme/scheme selectors and persistence with and without JavaScript.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
