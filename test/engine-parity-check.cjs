// Optional integration check; see docs/library.md for the browser tools setup.
//
// Geometry that depends on font metrics can differ between engines even when
// the CSS is identical. Chromium and Gecko disagree about `line-height:
// normal`, and about units derived from it, so a control sized against a line
// of text has to be measured in both. Everything here is a relationship
// between elements on the same page, never an absolute pixel count.
const playwright = require('playwright');
const assert = require('node:assert/strict');
const baseUrl = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
const themes = ['base', 'ink', 'paper', 'vivid', 'github', 'material'];
const engines = [
	['chromium', {executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']}],
	['firefox', {}],
];

(async () => {
	for(const [engine, options] of engines) {
		const browser = await playwright[engine].launch(options);
		try {
			const page = await browser.newPage({viewport: {width: 1200, height: 900}});
			for(const theme of themes) {
				await page.goto(`${baseUrl}/library/forms/?theme=${theme}`);
				await page.evaluate(() => document.fonts.ready);
				const row = await page.locator('#repeatable-fields li form').first().evaluate(form => {
					const box = selector => form.querySelector(selector).getBoundingClientRect();
					const centre = rect => Math.round(rect.y + rect.height / 2);
					const field = box('input'), text = box('.demo-button'), icon = box('.demo-icon-button');
					return {
						field: Math.round(field.height), text: Math.round(text.height),
						height: Math.round(icon.height), width: Math.round(icon.width),
						centres: [centre(field), centre(text), centre(icon)],
					};
				});
				const where = `${engine}/${theme}`;
				assert.equal(row.height, row.text, `${where}: icon button stands as tall as a button carrying words`);
				assert.ok(Math.abs(row.width - row.height) <= row.height * 0.1,
					`${where}: icon button is square within a tenth (${row.width}x${row.height})`);
				assert.equal(new Set(row.centres).size, 1,
					`${where}: field and actions share one centre (${row.centres.join(', ')})`);
			}
			console.log(`Passed control geometry in every theme: ${engine}`);
		} finally {
			await browser.close();
		}
	}
	console.log('Passed engine parity for text-relative control sizing.');
})().catch(error => {console.error(error); process.exit(1);});
