const test = require('node:test');
const assert = require('node:assert/strict');
const sass = require('sass');
const path = require('node:path');
const compile = source => sass.compileString(source, {
	loadPaths: [path.resolve(__dirname, '../style')], style: 'expanded',
}).css;

test('importing public definitions has no CSS or font side effects', () => {
	assert.equal(compile('@use "flair";'), '');
});

test('a button consumer emits its dependencies without form or element defaults', () => {
	const css = compile(`@use "flair";
.download {
	@extend %o-button;
}`);
	assert.match(css, /\.download:focus-visible/);
	assert.match(css, /--flair-control-padding-inline/);
	assert.doesNotMatch(css, /field-row|field-help|fieldset|:root|@font-face/);
	assert.doesNotMatch(css, /^button\s*\{/m);
});

test('form extension includes fields, rows, actions and native disabled state', () => {
	const css = compile(`@use "flair";
.profile {
	@extend %p-form-fields;
}`);
	for (const part of ['.field-row', '.field-help', '.field-error', '.actions', '.primary', ':disabled', ':focus-visible']) {
		assert.ok(css.includes(part), part);
	}
	assert.doesNotMatch(css, /!important|position:\s*(absolute|fixed)|@font-face/);
	assert.ok(css.length < 30000, `Unexpected selector growth: ${css.length} bytes`);
});

test('native element rules and default properties are explicitly opt-in', () => {
	const css = compile(`@use "flair";
:root {
	@include flair.defaults;
}
.editor {
	@include flair.controls;
}`);
	assert.match(css, /:root\s*\{/);
	assert.match(css, /\.editor :where\(input/);
	assert.doesNotMatch(css, /field-row|field-help/);
});

test('public overrides remain inherited, not reset on individual controls', () => {
	const css = compile(`@use "flair";
.profile {
	@extend %p-form-fields;
	--flair-control-padding-inline: 2rem;
}`);
	assert.match(css, /var\(--flair-control-padding-inline, var\(--flair-space-3\)\)/);
	assert.equal((css.match(/--flair-control-padding-inline:/g) || []).length, 1);
});

test('grid consumers do not emit surfaces, navigation or application width limits', () => {
	const css = compile(`@use "flair";
.results {
	@extend %p-grid;
}`);
	assert.match(css, /repeat\(auto-fit/);
	assert.match(css, /--flair-grid-columns, 3/);
	assert.doesNotMatch(css, /max-inline-size|background|aria-current|:root|@media/);
});

test('sidebar consumers wrap in source order without positioning offsets', () => {
	const css = compile(`@use "flair";
.workspace {
	@extend %l-sidebar;
}`);
	assert.match(css, /flex-wrap: wrap/);
	assert.match(css, /\.workspace > aside/);
	assert.doesNotMatch(css, /position:|order:|margin-left|100vw/);
});

test('disclosure extension preserves native visibility and marker behaviour', () => {
	const css = compile(`@use "flair";
.faq {
	@extend %p-accordion;
}`);
	assert.match(css, /details\[open\] > summary/);
	assert.match(css, /summary:focus-visible/);
	assert.doesNotMatch(css, /display: none|list-style: none|aria-hidden|button|table/);
});

test('every public placeholder can be consumed in isolation', () => {
	const fs = require('node:fs');
	const root = path.resolve(__dirname, '../style');
	const placeholders = new Set();
	for (const folder of ['decoration', 'object', 'pattern', 'layout']) {
		for (const file of fs.readdirSync(path.join(root, folder))) {
			const source = fs.readFileSync(path.join(root, folder, file), 'utf8');
			for (const match of source.matchAll(/^%([\w-]+)\s*\{/gm)) {
				placeholders.add(match[1]);
			}
		}
	}
	for (const placeholder of placeholders) {
		const css = compile(`@use "flair";
.consumer {
	@extend %${placeholder};
}`);
		assert.ok(css.includes('.consumer'), placeholder);
		assert.doesNotMatch(css, /@font-face|data-theme|section-switcher|!important/, placeholder);
	}
});
