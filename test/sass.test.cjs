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
