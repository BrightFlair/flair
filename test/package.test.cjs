const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// Copy only what npm would publish, so a consumer's build is reproduced exactly.
function published() {
	const target = fs.mkdtempSync(path.join(os.tmpdir(), 'flair-package-'));
	for (const entry of manifest.files) {
		const from = path.join(root, entry);
		const to = path.join(target, entry);
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.cpSync(from, to, { recursive: true });
	}
	return target;
}

// Everything an application is expected to reach for, in one sheet.
const consumer = `@use "flair" with (
	$break-nav: 46rem,
	$break-shell: 46rem,
	$icon-path: "/asset/glyph/",
	$icon-names: (trash, share)
);
@use "theme";

html {
	@include theme.base;
	@include theme.github;
}
:root { @include flair.base; }
body { @include flair.typography; @include flair.controls; @include flair.icon; }
.workspace {
	@include flair.application-shell;
	> aside { @extend %d-sidebar-contrast; @include flair.sidebar-bleed; }
	> aside > menu { @extend %p-side-navigation; }
}
.reading { @include flair.sticky-sidebar; }
.menu { @include flair.collapsible-navigation; }
.panel { @extend %p-panel; }
.fields { @extend %p-form-fields; }
.pairs { @extend %p-key-value-list; }
.repeat { @extend %p-repeatable-fields; }
.combo { @extend %p-compound-field; }
.region { @extend %p-labelled-region; }
.tree { @extend %p-syntax-tree; }
.row { @extend %p-row-actions; }
.empty { @extend %d-empty-message; }
.drawer { @extend %o-drawer; }
.glyph-button { @extend %o-icon-button; }
.frame { @extend %l-page-frame; }
.desk { @extend %l-workspace; }
`;

test('the published package alone compiles a complete application stylesheet', () => {
	const directory = published();
	try {
		const result = sass.compileString(consumer, {
			loadPaths: [path.join(directory, 'style')], style: 'expanded',
		});
		// Nothing outside the published file list may be reached.
		for (const url of result.loadedUrls.filter(url => url.protocol === 'file:')) {
			assert.ok(url.pathname.startsWith(directory), `reached outside the package: ${url.pathname}`);
		}
		assert.match(result.css, /min-width: 46rem/);
		assert.match(result.css, /--pal-1/);
		assert.doesNotMatch(result.css, /--flair-|--site-|@font-face/);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('the published file list covers every directory the entry point loads', () => {
	const result = sass.compileString('@use "flair";\n@use "theme";', {
		loadPaths: [path.resolve(root, 'style')],
	});
	const allowed = manifest.files.map(entry => path.resolve(root, entry));
	for (const url of result.loadedUrls.filter(url => url.protocol === 'file:')) {
		const file = decodeURIComponent(url.pathname);
		assert.ok(allowed.some(entry => file === entry || file.startsWith(`${entry}`)),
			`${path.relative(root, file)} is loaded but not published`);
	}
});
