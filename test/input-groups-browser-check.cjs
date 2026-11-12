// Optional browser tools and a running gallery: see docs/library.md.
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const path = require('node:path');
const base = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
const themes = ['base', 'bright', 'github', 'clean', 'gt'];
const routes = ['typography', 'controls', 'forms', 'surfaces', 'navigation', 'disclosures', 'tables', 'feedback', 'code', 'layouts'];
(async () => {
 const browser = await chromium.launch({executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
 try {
  const context = await browser.newContext({reducedMotion: 'reduce'});
  const page = await context.newPage();
  for(const theme of themes) for(const scheme of ['light', 'dark']) for(const width of [320, 1280]) {
   await page.setViewportSize({width, height: 1000});
   await page.goto(`${base}/library/forms/?theme=${theme}&scheme=${scheme}`);
   const group = page.locator('#input-groups .demo-input-group');
   assert.equal(await group.count(), 5);
   const geometry = await group.evaluateAll(groups => groups.map(g => ({
    width: g.getBoundingClientRect().width, available: g.parentElement.getBoundingClientRect().width,
    children: [...g.children].map(e => {
     const r = e.getBoundingClientRect(), s = getComputedStyle(e);
     return {left:r.left, right:r.right, top:r.top, height:r.height, border:parseFloat(s.borderInlineStartWidth),
      start:s.borderStartStartRadius, end:s.borderStartEndRadius};
    })
   })));
   for(const g of geometry) {
    assert.ok(Math.abs(g.width - g.available) < 1, `${theme}/${scheme}/${width}: one field width`);
    for(let i = 0; i < g.children.length; i++) {
     const c = g.children[i];
     assert.ok(Math.abs(c.top - g.children[0].top) < 1);
     assert.ok(Math.abs(c.height - g.children[0].height) < 1);
     if(i) {
      assert.equal(c.start, '0px');
      assert.ok(Math.abs(g.children[i-1].right - c.left - c.border) < 1, 'one border at each seam');
     }
     if(i < g.children.length-1) assert.equal(c.end, '0px');
    }
   }
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no page overflow');
   const prefix = page.getByRole('textbox', {name:'Email prefix', exact:true});
   await prefix.fill('alerts');
   await prefix.focus();
   assert.ok(await prefix.evaluate(e => parseFloat(getComputedStyle(e).outlineWidth) > 0), 'visible focus');
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(() => document.activeElement.name), 'hostname', 'Tab skips both disabled affixes');
   assert.equal(await page.getByRole('textbox', {name:'Fixed email domain', exact:true}).inputValue(), '@login.example.com');
   const data = await group.evaluateAll(groups => {
    const form = document.createElement('form'); groups.forEach(g => form.append(g.cloneNode(true)));
    return [...new FormData(form).keys()];
   });
   for(const name of ['senderDomain','scheme','separator']) assert.ok(!data.includes(name), 'disabled values are not submitted');
   const axe = await new AxeBuilder({page}).include('#input-groups').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
   assert.deepEqual(axe.violations.map(v => ({id:v.id, targets:v.nodes.map(n=>n.target)})), []);
   if(process.env.FLAIR_SCREENSHOTS && theme === 'bright' && scheme === 'light') {
    await prefix.fill('security');
    await page.evaluate(() => document.activeElement.blur());
    await page.locator('#input-groups').screenshot({path:path.join(process.env.FLAIR_SCREENSHOTS, `input-groups-${width}.png`)});
   }
   console.log(`Passed input groups: ${theme}/${scheme}/${width}`);
  }
  await page.goto(`${base}/library/forms/?theme=base&scheme=light`);
  await page.locator('#input-groups').evaluate(e=>e.dir='rtl');
  assert.ok(await groupRtl(page), 'RTL keeps DOM order and overlapping logical seams');
  for(const route of routes) {
   await page.goto(`${base}/library/${route}/`);
   const order = await page.locator('main.library-page').evaluate(main => {
    const children = [...main.children], divider = children.findIndex(e=>e.matches('hr.reference-divider'));
    return {dividers:children.filter(e=>e.matches('hr.reference-divider')).length, divider,
     examplesAfter:children.slice(divider+1).some(e=>e.querySelector('.flair-example')),
     last:children.at(-1).getAttribute('aria-labelledby'),
     explainerBefore:children.slice(0,divider).some(e=>['usage-title','form-dependencies','control-dependencies','control-tokens'].includes(e.getAttribute('aria-labelledby')))};
   });
   assert.equal(order.dividers, 1, route); assert.ok(order.divider > 0, route);
   assert.equal(order.examplesAfter, false, route); assert.equal(order.explainerBefore, false, route);
   assert.ok(['usage-title','form-dependencies','control-tokens'].includes(order.last), route);
  }
  console.log('Passed example/explainer ordering across all 10 library pages');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
async function groupRtl(page) {
 return page.locator('#input-groups .demo-input-group').evaluateAll(groups => groups.every(g => {
  const r=[...g.children].map(e=>e.getBoundingClientRect());
  return r.every((v,i)=>!i || Math.abs(r[i-1].left-v.right+parseFloat(getComputedStyle(g.children[i]).borderInlineStartWidth))<1);
 }));
}
