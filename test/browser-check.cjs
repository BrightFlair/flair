// Optional integration checks; see docs/library.md for the separate browser tools setup.
const {chromium} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const baseUrl = process.env.FLAIR_TEST_URL || 'http://localhost:8084';
const routes = ['typography', 'controls', 'forms', 'surfaces', 'navigation', 'disclosures', 'tables', 'feedback', 'code', 'layouts'];
const themes = ['base', 'ink', 'paper', 'vivid', 'github', 'material'];

(async () => {
	const browser = await chromium.launch({
		executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium',
		args: ['--no-sandbox'],
	});
	try {
		const context = await browser.newContext();
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		for(const theme of themes) {
			for(const width of [320, 768, 1440]) {
				await page.setViewportSize({width, height: 1000});
				for(const route of routes) {
					const response = await page.goto(`${baseUrl}/library/${route}/?theme=${theme}`);
					assert.equal(response.status(), 200, route);
					await page.evaluate(() => document.fonts.ready);
					assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${theme} ${width} ${route}: page overflow`);
					assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
					if(theme === 'base' && route === 'layouts') {
						const columns = await page.locator('[data-grid-default]').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
						assert.equal(columns, width === 320 ? 1 : width === 768 ? 2 : 3);
						assert.equal(await page.locator('[data-grid-narrow]').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), 1);
					}
					if(width === 1440) {
						const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
						assert.deepEqual(result.violations.map(item => ({id: item.id, targets: item.nodes.map(node => node.target)})), [], `${theme} ${route}`);
					}
				}
			}
			console.log(`Passed pages, widths and accessibility: ${theme}`);
		}

		await page.goto(`${baseUrl}/library/disclosures/?theme=material`);
		const opener = page.locator('#dialog [data-dialog-open]');
		await opener.click();
		assert.ok(await page.locator('#dialog dialog').evaluate(element => element.matches(':modal')));
		await page.keyboard.press('Escape');
		assert.equal(await page.locator('#dialog dialog').getAttribute('open'), null);
		assert.ok(await opener.evaluate(element => document.activeElement === element));
		await opener.click();
		await page.locator('#dialog [data-dialog-close]').click();
		assert.equal(await page.locator('#dialog dialog').getAttribute('open'), null);
		const actions = page.locator('#dialog-actions');
		for(const value of ['keep', 'discard']) {
			await actions.locator('[data-dialog-open]').click();
			await actions.locator(`button[value="${value}"]`).click();
			assert.equal(await actions.locator('dialog').evaluate(element => element.returnValue), value);
			assert.equal(await actions.locator('dialog[open]').count(), 0);
		}
		const required = page.locator('#dialog-form');
		await required.locator('[data-dialog-open]').click();
		await required.locator('button[value="submit"]').click();
		assert.equal(await required.locator('dialog[open]').count(), 1);
		assert.ok(await required.locator('input').evaluate(element => element.validity.valueMissing));
		await required.locator('button[value="cancel"]').click();
		assert.equal(await required.locator('dialog[open]').count(), 0);
		await required.locator('[data-dialog-open]').click();
		await required.locator('input').fill('Example project');
		await required.locator('button[value="submit"]').click();
		assert.equal(await required.locator('dialog[open]').count(), 0);
		assert.equal(await required.locator('dialog').evaluate(element => element.returnValue), 'submit');
		await required.locator('[data-dialog-open]').click();
		await page.keyboard.press('Escape');
		assert.equal(await required.locator('dialog').evaluate(element => element.returnValue), '');
		await page.locator('#exclusive .demo-accordion > details > summary').first().click();
		await page.locator('#exclusive .demo-accordion > details > summary').last().click();
		assert.equal(await page.locator('#exclusive .demo-accordion > details[open]').count(), 1);

		await page.goto(`${baseUrl}/library/feedback/`);
		assert.equal(await page.locator('html').getAttribute('data-theme'), 'material');
		for(const value of ['60', '80', '100', '0']) {
			await page.locator('[data-progress-step]').click();
			assert.equal(await page.locator('progress').getAttribute('value'), value);
		}
		await page.goto(`${baseUrl}/library/code/`);
		await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {writeText: async text => { window.copiedExample = text; }},
		}));
		await page.locator('[data-copy-button]').click();
		await page.waitForFunction(() => document.querySelector('[data-copy-status]').textContent === 'Code copied.');
		assert.equal(await page.evaluate(() => window.copiedExample), await page.locator('[data-copy-example] pre').textContent());
		await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {writeText: async () => { throw new Error('Permission denied'); }},
		}));
		await page.locator('[data-copy-button]').click();
		await page.waitForFunction(() => document.querySelector('[data-copy-status]').textContent.includes('manually'));

		// Opening documentation sources must not widen the page either.
		await page.setViewportSize({width: 320, height: 1000});
		await page.goto(`${baseUrl}/library/layouts/`);
		await page.locator('.reference-source').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
		assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
		await page.locator('select[name="theme"]').selectOption('base');
		await page.reload();
		assert.equal(await page.locator('html').getAttribute('data-theme'), 'base');

		const nojs = await browser.newContext({javaScriptEnabled: false});
		const staticPage = await nojs.newPage();
		await staticPage.goto(`${baseUrl}/library/disclosures/`);
		assert.equal(await staticPage.locator('dialog[open]').count(), 3);
		await staticPage.locator('#single .demo-disclosure > summary').click();
		assert.equal(await staticPage.locator('#single details[open]').count(), 1);
		await staticPage.locator('select[name="theme"]').selectOption('github');
		await Promise.all([staticPage.waitForNavigation(), staticPage.locator('.theme-form button').click()]);
		assert.equal(await staticPage.locator('html').getAttribute('data-theme'), 'github');
		await staticPage.goto(`${baseUrl}/library/forms/`);
		await staticPage.locator('#contained-form input[name="q"]').fill('layout');
		await Promise.all([staticPage.waitForNavigation(), staticPage.locator('#contained-form button[type="submit"]').click()]);
		assert.equal(new URL(staticPage.url()).searchParams.get('q'), 'layout');
		assert.deepEqual(errors, []);
		console.log('Passed interactions, theme persistence, source overflow and no-JavaScript fallbacks.');
	}
	finally {
		await browser.close();
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
