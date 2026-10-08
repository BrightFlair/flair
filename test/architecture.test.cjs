const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sass = require('sass');
const root = path.resolve(__dirname, '../style');
const compile = source => sass.compileString(source, {loadPaths: [root]}).css;

test('base colours are monochrome and fonts need no downloads', () => {
 const css = compile('@use "theme/base"; :root { @include base.base; }');
 for(const [, colour] of css.matchAll(/#([0-9a-f]{3,6})\b/gi)) {
  const channels = colour.length === 3 ? [...colour] : colour.match(/../g);
  assert.equal(new Set(channels).size, 1, `Non-neutral base colour: #${colour}`);
 }
 assert.match(css, /system-ui/);
 assert.doesNotMatch(css, /Ubuntu|Inter|Mona|url\(|@font-face|contrast-color/);
 for(let step = 1; step <= 12; step++) assert.ok(css.includes(`--theme-space-${step}:`));
});

test('each theme starts from base and importing themes has no side effects', () => {
 assert.equal(compile('@use "theme";'), '');
 for(const name of ['bright', 'github', 'clean', 'gt']) {
  const source = fs.readFileSync(path.join(root, `theme/${name}.scss`), 'utf8');
  assert.match(source, /@use "base"/);
  assert.match(source, /@include base\.base/);
  assert.doesNotMatch(source, /--site-|--authwave-|%[doplc]-|@extend|@media|@font-face/);
  const css = compile(`@use "theme/${name}"; .scope { @include ${name}.${name}; }`);
  for(const value of ['--theme-space-1:', '--theme-color-muted:', '--theme-font-size:', '--theme-choice-size:']) assert.ok(css.includes(value), `${name}: ${value}`);
 }
});

test('appearance does not depend on structural layers or arrange children', () => {
 for(const name of fs.readdirSync(path.join(root, 'decoration'))) {
  if(name === 'visually-hidden.scss' || name === 'highlight.scss') continue;
  const source = fs.readFileSync(path.join(root, 'decoration', name), 'utf8').replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(source, /@use "\.\.\/(object|pattern|layout|element)\//, name);
  assert.doesNotMatch(source, /(?:^|\n)\s*(?:display|position|padding[\w-]*|margin[\w-]*|gap|grid[\w-]*|align[\w-]*|justify[\w-]*|(?:min-|max-)?(?:inline|block)-size):/, name);
 }
});

test('layouts cannot choose the appearance or contents of their regions', () => {
 for(const name of fs.readdirSync(path.join(root, 'layout'))) {
  const source = fs.readFileSync(path.join(root, 'layout', name), 'utf8').replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(source, /@use "\.\.\/(decoration|object|pattern|element)\//, name);
  assert.doesNotMatch(source, /(?:^|\n)\s*(?:color|background[\w-]*|border[\w-]*|box-shadow|font[\w-]*):/, name);
 }
});
