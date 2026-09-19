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
	assert.match(css, /--theme-control-padding-inline/);
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
	--theme-control-padding-inline: 2rem;
}`);
	assert.match(css, /var\(--theme-control-padding-inline, var\(--theme-space-3\)\)/);
	assert.equal((css.match(/--theme-control-padding-inline:/g) || []).length, 1);
});

test('grid consumers do not emit surfaces, navigation or application width limits', () => {
	const css = compile(`@use "flair";
.results {
	@extend %p-grid;
}`);
	assert.match(css, /repeat\(auto-fit/);
	assert.match(css, /--theme-grid-columns, 3/);
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
				const variants = [...source.matchAll(/^\s+&-([\w-]+)\s*\{/gm)];
				if (variants.length) {
					for (const variant of variants) placeholders.add(`${match[1]}-${variant[1]}`);
				} else {
					placeholders.add(match[1]);
				}
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

test('library placeholders have one matching file and explicit dependencies', () => {
	const fs = require('node:fs');
	const root = path.resolve(__dirname, '../style');
	for (const [folder, prefix] of Object.entries({ decoration: 'd', object: 'o', pattern: 'p', layout: 'l' })) {
		for (const file of fs.readdirSync(path.join(root, folder)).filter(file => file.endsWith('.scss'))) {
			const source = fs.readFileSync(path.join(root, folder, file), 'utf8');
			const owner = `${prefix}-${path.basename(file, '.scss')}`;
			assert.deepEqual([...source.matchAll(/^%([\w-]+)\s*\{/gm)].map(match => match[1]), [owner], `${folder}/${file}`);
			const variants = [...source.matchAll(/^\s+&-([\w-]+)\s*\{/gm)];
			const names = variants.length ? variants.map(match => `${owner}-${match[1]}`) : [owner];
			for (const name of names) {
				const css = compile(`@use "${folder}/${path.basename(file, '.scss')}"; .consumer { @extend %${name}; }`);
				assert.ok(css.includes('.consumer'), `${folder}/${file}: ${name}`);
			}
		}
	}
});

test('typography base and nested variants can be extended independently', () => {
	const base = compile('@use "decoration/typography"; .copy { @extend %d-typography; }');
	assert.match(base, /--theme-font-body/);
	assert.doesNotMatch(base, /--theme-heading|--theme-lead|--theme-eyebrow/);
	for (const variant of ['heading', 'lead', 'eyebrow']) {
		const css = compile(`@use "decoration/typography"; .copy { @extend %d-typography-${variant}; }`);
		assert.ok(css.includes(`--theme-${variant}`), variant);
		assert.doesNotMatch(css, /--theme-text-leading/);
		for (const other of ['heading', 'lead', 'eyebrow'].filter(name => name !== variant)) {
			assert.ok(!css.includes(`--theme-${other}`), `${variant} must not emit ${other}`);
		}
	}
});

test('checklists remain independent of pricing, card surfaces and application fonts', () => {
	const css = compile(`@use "flair";
.features {
	@extend %p-checklist;
}`);
	assert.match(css, /checklist-marker/);
	assert.match(css, /data-available=false/);
	assert.doesNotMatch(css, /authwave|plan-price|@font-face|Morion|:root/);
});

test('theme mixins are opt-in and export no website selectors or font downloads', () => {
	assert.equal(compile('@use "theme";'), '');
	for (const name of ['base', 'ink', 'paper', 'vivid', 'github', 'material']) {
		const css = compile(`@use "theme"; .theme { @include theme.${name}; }`);
		assert.equal(compile(`@use "theme/${name}" as theme; .theme { @include theme.${name}; }`), css);
		assert.match(css, /--theme-color-text/);
		assert.doesNotMatch(css, /--site-|:root|data-flair-theme|@font-face|url\(/);
	}
});

test('metric alignment applies to the value and responsive actions', () => {
	const css = compile('@use "flair"; .metric { @extend %p-metric; --theme-metric-align: end; }');
	assert.match(css, /text-align: var\(--theme-metric-align, center\)/);
	assert.match(css, /justify-content: var\(--theme-metric-align, center\)/);
	assert.match(css, /font-variant-numeric: tabular-nums/);
	assert.doesNotMatch(css, /counter-a|single-counter/);
});

test('state decorations respect reduced motion and remain independent of Flux', () => {
	const css = compile('@use "flair"; .busy { @extend %d-state-busy; } .drag { @extend %d-state-dragging; } .reveal { @extend %d-state-reveal; }');
	assert.match(css, /prefers-reduced-motion: reduce/);
	assert.match(css, /print/);
	assert.doesNotMatch(css, /flux|pointer-events|display: none/);
});

test('all new patterns have live examples and source in the appropriate documentation sections', () => {
	const fs = require('node:fs');
	const pages = {
		feedback: ['metrics', 'interaction-states', 'empty-messages'],
		surfaces: ['action-lists', 'panels', 'row-actions'],
		navigation: ['search-results', 'accessible-helpers', 'navigation-markers', 'side-navigation'],
		layouts: ['page-frame', 'workspace', 'fixed-footer', 'breakpoints'],
		typography: ['page-intro', 'theme-presets', 'palette'],
		code: ['document-baseline', 'syntax-trees', 'labelled-regions'],
		controls: ['icons', 'icon-buttons'],
		forms: ['compound-fields', 'repeatable-fields'],
		disclosures: ['drawers'],
		tables: ['key-value-lists'],
	};
	for (const [page, ids] of Object.entries(pages)) {
		const html = fs.readFileSync(path.resolve(__dirname, `../page/library/${page}.html`), 'utf8');
		// Slice on reference-section boundaries; an example may contain its
		// own sections, so the first closing tag is not the section's end.
		const sections = html.split('<section class="reference-section"').slice(1);
		for (const id of ids) {
			const section = sections.find(part => new RegExp(`^[^>]*\\bid="${id}"`).test(part));
			assert.ok(section, `${page}: ${id} section`);
			assert.ok(section.includes('class="flair-example"'), `${page}: ${id} live example`);
			assert.ok(section.includes('HTML and Sass'), `${page}: ${id} source`);
		}
	}
});

test('application shells accept semantic selectors without emitting utility classes or theme styles', () => {
 const css = compile(`@use "flair";
 .workspace { @include flair.application-shell($sidebar: "> header", $content: "> main", $from: 46rem); }
 `);
 assert.match(css, /\.workspace > header/);
 assert.match(css, /\.workspace > main/);
 assert.match(css, /min-width: 46rem/);
 assert.match(css, /minmax\(0, 1fr\)/);
 assert.doesNotMatch(css, /layout-content|background|color:|font-family|:root/);
});
