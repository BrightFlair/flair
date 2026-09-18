const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sass = require('sass');
const root = path.resolve(__dirname, '../style');

// Read SCSS statements at their actual brace depth, ignoring comments, strings
// and semicolons inside argument lists. Indentation is not structural in Sass.
function statements(source) {
	const result = [];
	let text = '', quote = null, depth = 0, parentheses = 0, opening = -1;
	for (let i = 0; i < source.length; i++) {
		const char = source[i];
		if (quote) {
			text += char;
			if (char === '\\') text += source[++i];
			else if (char === quote) quote = null;
			continue;
		}
		if (source.slice(i, i + 2) === '//') {
			while (i < source.length && source[i] !== '\n') i++;
			text += '\n';
			continue;
		}
		if (source.slice(i, i + 2) === '/*') {
			i = source.indexOf('*/', i + 2);
			assert.notEqual(i, -1, 'Unclosed comment');
			i++;
			text += ' ';
			continue;
		}
		if (char === '"' || char === "'") quote = char;
		if (char === '(') parentheses++;
		if (char === ')') parentheses--;
		if (char === '{' && depth++ === 0) opening = text.length;
		text += char;
		if (char === '}' && --depth === 0) {
			result.push({ header: text.slice(0, opening).trim(), body: text.slice(opening + 1, -1) });
			text = '';
		} else if (char === ';' && depth === 0 && parentheses === 0) {
			result.push({ header: text.trim(), body: null });
			text = '';
		}
	}
	assert.equal(depth, 0, 'Unbalanced SCSS');
	assert.equal(text.trim(), '', `Unparsed statement: ${text}`);
	return result;
}

function* styles(directory = root) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const file = path.join(directory, entry.name);
		if (entry.isDirectory()) yield* styles(file);
		else if (file.endsWith('.scss')) yield file;
	}
}

function definitions(nodes) {
	return nodes.flatMap(node => {
		if (node.body === null) return [];
		if (/^@(each|for|if|else)\b/.test(node.header)) return definitions(statements(node.body));
		return [node];
	});
}

test('every stylesheet defines one owner whose name matches its filename', () => {
	const composition = new Set(['flair.scss', 'style.scss', 'playground/index.scss', 'site/base.scss', 'theme/index.scss']);
	for (const file of styles()) {
		const relative = path.relative(root, file);
		const name = path.basename(file, '.scss');
		const nodes = statements(fs.readFileSync(file, 'utf8'));
		const owners = definitions(nodes);
		if (composition.has(relative)) {
			assert.equal(owners.length, 0, relative);
			assert.ok(nodes.every(node => /^@(use|forward)\b/.test(node.header)
				|| (relative === 'site/base.scss' && node.header === '@include flair.base;')), relative);
			continue;
		}
		assert.equal(owners.length, 1, `${relative}: expected exactly one selector, mixin, placeholder or font family`);
		const owner = owners[0];
		if (owner.header === '@font-face') {
			const family = owner.body.match(/font-family:\s*"([^"]+)"/)[1];
			assert.equal(family.toLowerCase().replaceAll(' ', '-'), name, relative);
		} else if (owner.header.startsWith('@mixin ')) {
			assert.equal(owner.header.match(/^@mixin ([\w-]+)/)[1], name, relative);
			assert.ok(['mixin', 'theme'].includes(path.dirname(relative)), relative);
		} else if (owner.header.startsWith('%')) {
			const prefixes = { decoration: 'd', object: 'o', pattern: 'p', layout: 'l' };
			assert.equal(owner.header, `%${prefixes[path.dirname(relative)]}-${name}`, relative);
		} else {
			assert.match(owner.header, /^(?:\.|:{1,2})?[\w-]+$/, relative);
			assert.equal(owner.header.replace(/^[.:]+/, ''), name, relative);
		}
	}
});

test('each mixin can be imported directly and through the public entry point', () => {
	for (const file of fs.readdirSync(path.join(root, 'mixin'))) {
		const name = path.basename(file, '.scss');
		const direct = sass.compileString(`@use "mixin/${name}"; .consumer { @include ${name}.${name}; }`, { loadPaths: [root] }).css;
		const publicCss = sass.compileString(`@use "flair"; .consumer { @include flair.${name}; }`, { loadPaths: [root] }).css;
		assert.ok(direct.includes('.consumer'), name);
		assert.ok(publicCss.includes('.consumer'), name);
		assert.doesNotMatch(direct + publicCss, /@font-face|--site-/);
	}
});

// Keep mobile defaults in the base rules; wider layouts are enhancements.
test('responsive styles do not introduce desktop-first width queries', () => {
	for(const file of styles()) {
		const source = fs.readFileSync(file, 'utf8');
		assert.doesNotMatch(source, /@(media|container)[^{]*(?:max-width|width\s*<=?)/, path.relative(root, file));
	}
});
