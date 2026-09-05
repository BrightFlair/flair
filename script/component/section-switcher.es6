for(const switcher of document.querySelectorAll("section-switcher")) {
	const form = switcher.querySelector("form");
	const select = form.querySelector("select");
	const submit = form.querySelector('[type="submit"]');
	select.addEventListener("change", () => submit.click());
	submit.hidden = true;

	const button = switcher.querySelector(".switcher-position");
	const label = button.querySelector(".position-label");
	const arrow = button.querySelector("[aria-hidden]");
	const update = () => {
		const atBottom = switcher.dataset.position === "bottom";
		label.textContent = atBottom ? "Move up" : "Move down";
		arrow.textContent = atBottom ? "↑" : "↓";
		button.title = atBottom ? "Move navigation to the top" : "Move navigation to the bottom";
		button.setAttribute("aria-label", button.title);
	};
	button.hidden = false;
	update();
	button.addEventListener("click", () => {
		switcher.dataset.position = switcher.dataset.position === "bottom" ? "top" : "bottom";
		update();
	});
}
