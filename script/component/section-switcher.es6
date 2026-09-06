for(const switcher of document.querySelectorAll("section-switcher")) {
	const sectionForm = switcher.querySelector(".section-form");
	const sectionSelect = sectionForm.querySelector("select");
	const sectionSubmit = sectionForm.querySelector('[type="submit"]');
	sectionSelect.addEventListener("change", () => sectionSubmit.click());
	sectionSubmit.hidden = true;

	const themeForm = switcher.querySelector(".theme-form");
	const themeSelect = themeForm.querySelector("select");
	themeSelect.addEventListener("change", () => {
		const theme = themeSelect.value;
		document.documentElement.dataset.theme = theme;
		document.cookie = `flair-theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
		// A no-JavaScript theme submission may have left a theme in the URL.
		// Keep it consistent so reloading retains the current selection.
		const url = new URL(window.location.href);
		if(url.searchParams.has("theme")) {
			url.searchParams.set("theme", theme);
			window.history.replaceState(null, "", url);
		}
	});
	themeForm.querySelector('[type="submit"]').hidden = true;
}
