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
	const schemeRadios = [...themeForm.querySelectorAll('input[type="radio"][name="scheme"]')];
	let selectedScheme = schemeSelect?.value ?? schemeRadios.find(input => input.checked)?.value ?? "system";
	const root = document.documentElement;
	const colourControls = [
		{name: "tint", property: "--theme-color-tint"},
		{name: "primary", property: "--theme-color-primary"},
	].map(control => ({
		...control,
		input: themeForm.querySelector(`input[name="${control.name}"]`),
		presetInput: themeForm.querySelector(`input[name="${control.name}-preset"]`),
		custom: themeForm.querySelector(`input[name="${control.name}"]`).dataset.custom === "true",
	}));
	const toHex = colour => {
		const rgb = colour.match(/^rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)/i);
		const srgb = colour.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
		const channels = rgb?.slice(1, 4).map(Number)
			?? srgb?.slice(1, 4).map(value => Number(value) * 255);
		if(!channels) return null;
		return `#${channels.map(value => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
	};
	const themeDefault = property => {
		const inlineValue = root.style.getPropertyValue(property);
		const inlinePriority = root.style.getPropertyPriority(property);
		root.style.removeProperty(property);
		const probe = document.createElement("span");
		probe.style.color = `var(${property})`;
		probe.hidden = true;
		document.body.append(probe);
		const value = toHex(getComputedStyle(probe).color);
		probe.remove();
		if(inlineValue) root.style.setProperty(property, inlineValue, inlinePriority);
		return value;
	};
	const clearPreference = (control, url) => {
		control.custom = false;
		control.input.dataset.custom = "false";
		root.style.removeProperty(control.property);
		document.cookie = `flair-${control.name}=; Path=/; Max-Age=0; SameSite=Lax`;
		url.searchParams.delete(control.name);
	};
	const update = ({resetColours = false} = {}) => {
		const theme = themeSelect.value;
		const scheme = selectedScheme;
		const url = new URL(window.location.href);
		root.dataset.flairTheme = theme;
		if(scheme === "system") delete root.dataset.theme;
		else root.dataset.theme = scheme;
		if(resetColours) {
			for(const control of colourControls) clearPreference(control, url);
		}
		for(const control of colourControls) {
			const preset = themeDefault(control.property);
			if(preset) control.presetInput.value = preset;
			if(control.custom) {
				root.style.setProperty(control.property, control.input.value);
				document.cookie = `flair-${control.name}=${control.input.value}; Path=/; Max-Age=31536000; SameSite=Lax`;
				if(url.searchParams.has(control.name)) url.searchParams.set(control.name, control.input.value);
			}
			else {
				root.style.removeProperty(control.property);
				if(preset) control.input.value = preset;
			}
		}
		for(const [name, value] of [["theme", theme], ["scheme", scheme]]) {
			document.cookie = `flair-${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
			if(url.searchParams.has(name)) url.searchParams.set(name, value);
		}
		window.history.replaceState(null, "", url);
	};
	themeSelect.addEventListener("change", () => update({resetColours: true}));
	schemeSelect?.addEventListener("change", () => {
		selectedScheme = schemeSelect.value;
		update();
	});
	for(const radio of schemeRadios) {
		radio.addEventListener("keydown", event => {
			if(event.key === " " && selectedScheme === radio.value) {
				event.preventDefault();
				radio.checked = false;
				selectedScheme = "system";
				update();
			}
		});
		radio.addEventListener("click", () => {
			if(selectedScheme === radio.value) {
				radio.checked = false;
				selectedScheme = "system";
			}
			else selectedScheme = radio.value;
			update();
		});
		radio.addEventListener("change", () => {
			selectedScheme = schemeRadios.find(input => input.checked)?.value ?? "system";
			update();
		});
	}
	for(const control of colourControls) {
		control.input.addEventListener("input", () => {
			control.custom = true;
			control.input.dataset.custom = "true";
			update();
		});
	}
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
		if(selectedScheme === "system") update();
	});
	update();
	themeForm.querySelector('[type="submit"]').hidden = true;
}
