for(const switcher of document.querySelectorAll("section-switcher")) {
	const sectionForm = switcher.querySelector(".section-form");
	const sectionSelect = sectionForm.querySelector("select");
	const sectionSubmit = sectionForm.querySelector('[type="submit"]');
	sectionSelect.addEventListener("change", () => sectionSubmit.click());
	sectionSubmit.hidden = true;

}

for(const themeForm of document.querySelectorAll("section-switcher .theme-form, playground-tools form")) {
	const themeSelect = themeForm.querySelector('select[name="theme"]');
	const schemeSelect = themeForm.querySelector('select[name="scheme"]');
	const update = () => {
		const theme = themeSelect.value;
		const scheme = schemeSelect.value;
		document.documentElement.dataset.flairTheme = theme;
		if(scheme === "system") delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = scheme;
		const url = new URL(window.location.href);
		for(const [name, value] of [["theme", theme], ["scheme", scheme]]) {
			document.cookie = `flair-${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
			if(url.searchParams.has(name)) url.searchParams.set(name, value);
		}
		window.history.replaceState(null, "", url);
	};
	themeSelect.addEventListener("change", update);
	schemeSelect.addEventListener("change", update);
	themeForm.querySelector('[type="submit"]').hidden = true;
}
