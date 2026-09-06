// Gallery controls only. The form library itself requires no JavaScript.
for(const section of document.querySelectorAll("[data-form-example]")) {
	const settings = section.querySelector(".demo-settings");
	const example = section.querySelector(".flair-example");
	settings.hidden = false;
	for(const select of settings.querySelectorAll("select[data-setting]")) {
		select.addEventListener("change", () => {
			example.dataset[select.dataset.setting] = select.value;
		});
	}
}
