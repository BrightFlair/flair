// Optional, read-only comparison against the actual reference styles.
// FLAIR_GITHUB_REFERENCE=/path/to/reference NODE_PATH=/tmp/flair-review/node_modules node test/github-reference-check.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const sass = require('sass');
const {chromium} = require('playwright');
const reference = process.env.FLAIR_GITHUB_REFERENCE;
assert.ok(reference, 'Set FLAIR_GITHUB_REFERENCE to the reference checkout.');
const compile = source => sass.compileString(source, {loadPaths: [path.resolve('style'), path.join(reference, 'style')]}).css;
const sourceCss = compile(`
@use "${reference}/style/style";
@use "${reference}/style/decoration/sidebar";
aside { @extend %d-sidebar; }
`);
const flairCss = compile(`
@use "flair";
@use "theme/github" as theme;
:root { @include flair.defaults; @include theme.github; font: 400 14px/normal var(--flair-font-body); }
@include flair.base;
body { background: var(--flair-color-surface); color: var(--flair-color-text); }
global-header { display:block; background:var(--flair-color-surface-disabled); border-bottom:1px solid var(--flair-color-border); }
global-header nav { @extend %p-page-tabs; margin-inline:1rem; }
aside { display:block; width:24rem; }
aside nav { @extend %p-side-navigation; }
form { @include flair.controls; }
button.positive { @extend %o-button-primary; }
`);
const font = `@font-face {font-family:"Mona Sans";font-style:normal;font-weight:200 900;font-stretch:75% 125%;src:url(data:font/ttf;base64,${fs.readFileSync('asset/font/mona-sans/normal.ttf').toString('base64')})}`;
const links = source => ['Overview', 'Activity', 'Settings'].map((text, i) => `<li ${source && !i ? 'class="selected"' : ''}><a href="#section-${i}" ${!i ? 'aria-current="page"' : ''}>${text}</a></li>`).join('');
const fixture = source => `<!doctype html><html lang="en"><meta charset="utf-8"><title>Component comparison</title><style>${source ? sourceCss : flairCss}\n${font}\nform {width:320px;margin:2rem;}</style><body><global-header>${source ? '<menu>' : '<nav><ul>'}${links(source)}${source ? '</menu>' : '</ul></nav>'}</global-header><aside>${source ? '<menu>' : '<nav><ul>'}${links(source)}${source ? '</menu>' : '</ul></nav>'}</aside><form><input aria-label="Name" value="Example"><select aria-label="Format"><option>Plain text</option></select><textarea aria-label="Content">Sample content</textarea><button type="button">Save draft</button><button type="button" class="positive">Publish</button></form></body></html>`;
const properties = ['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','opacity','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','borderTopWidth','borderTopColor','borderRadius','boxShadow','transitionDuration','transitionTimingFunction'];
(async () => {
 const browser = await chromium.launch({executablePath:process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
 try {
  const context = await browser.newContext({viewport:{width:1200,height:900},colorScheme:'light'});
  const pages = await Promise.all([context.newPage(),context.newPage()]);
  for(let i=0;i<2;i++) {await pages[i].setContent(fixture(i===0));await pages[i].evaluate(()=>document.fonts.ready);}
  const differences=[];
  for(const selector of ['global-header li:first-child > a','global-header li:nth-child(2) > a','aside li:first-child > a','aside li:nth-child(2) > a','input','select','textarea','button:not(.positive)','button.positive']) {
   for(const state of ['rest','hover','focus']) {
    const values=[];
    for(const page of pages) {
     await page.bringToFront();
     await page.mouse.move(1100,850);
     await page.evaluate(()=>document.activeElement.blur());
     const item=page.locator(selector);
     if(state==='hover') await item.hover();
     if(state==='focus') {await page.keyboard.press('Tab');await item.focus();}
     await page.waitForTimeout(130);
     values.push(await item.evaluate((e,properties)=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return {...Object.fromEntries(properties.map(p=>[p,s[p]])),width:r.width,height:r.height};},properties));
    }
    for(const key of Object.keys(values[0])) if(values[0][key]!==values[1][key]) differences.push({selector,state,property:key,reference:values[0][key],flair:values[1][key]});
   }
  }
  fs.mkdirSync('/tmp/flair-github-parity',{recursive:true});
  const headerImages = [], sidebarImages = [];
  for(let i=0;i<2;i++) {await pages[i].bringToFront();await pages[i].mouse.move(1100,850);await pages[i].evaluate(()=>document.activeElement.blur());await pages[i].locator('global-header li:nth-child(2) > a').hover();await pages[i].waitForTimeout(130);headerImages.push(await pages[i].locator('global-header').screenshot());sidebarImages.push(await pages[i].locator('aside').screenshot());await pages[i].screenshot({path:`/tmp/flair-github-parity/${i===0?'reference':'flair'}.png`});}
  assert.ok(headerImages[0].equals(headerImages[1]), 'Header screenshots differ');
  assert.ok(sidebarImages[0].equals(sidebarImages[1]), 'Sidebar screenshots differ');
  console.log(JSON.stringify(differences,null,2));
  assert.deepEqual(differences, [], 'Reference component differences');
  console.log('Matched reference navigation and native controls at rest, hover and keyboard focus.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
