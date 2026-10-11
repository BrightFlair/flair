// Optional browser tooling: see docs/library.md. No website server is required.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sass = require('sass');

(async () => {
	const browser = await chromium.launch({
		executablePath: process.env.FLAIR_CHROMIUM_PATH || '/usr/bin/chromium',
		args: ['--no-sandbox'],
	});
	try {
		const page = await browser.newPage({ javaScriptEnabled: false });
		const html = fs.readFileSync(path.resolve(__dirname, '../page/library/disclosures.html'), 'utf8');
		const example = html.match(/<section class="reference-section" id="popovers"[\s\S]*?<\/section>/)[0];
		for (const theme of ['base', 'bright', 'github', 'clean', 'gt']) {
			const css = sass.compileString(`@use "flair"; @use "theme/${theme}" as theme;
				:root { @include theme.${theme}; }
				.demo-button { @extend %o-button; }
				.demo-popover { @extend %o-popover; }`, {
				loadPaths: [path.resolve(__dirname, '../style/lib')],
			}).css;
			for (const width of [320, 768, 1440]) {
				await page.setViewportSize({ width, height: 600 });
				// Clip the containing example: top-layer content must remain usable.
				await page.setContent(`<style>${css} .flair-example { overflow: hidden; height: 50px; }</style>${example}`);
				const trigger = page.getByRole('button', { name: 'Connection information', exact: true });
				const popover = page.locator('#connection-popover');
				assert.equal(await popover.isVisible(), false);
				await trigger.focus();
				await page.keyboard.press('Enter');
				assert.ok(await popover.isVisible(), `${theme} ${width}: keyboard opens without JavaScript`);
				const rect = await popover.boundingBox();
				assert.ok(rect.x >= 0 && rect.x + rect.width <= width, `${theme} ${width}: within viewport`);
				assert.ok(rect.y >= 0 && rect.y + rect.height <= 600);
				await page.keyboard.press('Tab');
				assert.equal(await page.getByRole('button', { name: 'Close information' }).evaluate(el => el === document.activeElement), true);
				await page.keyboard.press('Escape');
				assert.equal(await popover.isVisible(), false);
				assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
				await trigger.click();
				await trigger.click();
				assert.equal(await popover.isVisible(), false, 'trigger toggles closed');
				await trigger.click();
				await page.getByRole('button', { name: 'Close information' }).click();
				assert.equal(await popover.isVisible(), false, 'explicit close works');
				await trigger.click();
				await page.mouse.click(width - 1, 599);
				assert.equal(await popover.isVisible(), false, 'outside click dismisses');
				await popover.locator('p').evaluate(el => el.textContent = 'More connection information. '.repeat(200));
				await trigger.click();
				assert.ok(await popover.evaluate(el => el.scrollHeight > el.clientHeight), 'long content scrolls');
				const longRect = await popover.boundingBox();
				assert.ok(longRect.y >= 0 && longRect.y + longRect.height <= 600);
			}
		}
		console.log('Passed native popover interaction and scrolling without JavaScript in all themes at three widths.');
	} finally {
		await browser.close();
	}
})().catch(error => { console.error(error); process.exit(1); });
