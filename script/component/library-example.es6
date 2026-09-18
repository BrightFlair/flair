// Documentation interactions only. The public Sass library has no runtime dependency.
for(const example of document.querySelectorAll("[data-dialog-example]")) {
	const dialog = example.querySelector("dialog");
	const opener = example.querySelector("[data-dialog-open]");
	if(typeof dialog.showModal !== "function") {
		continue;
	}
	dialog.close();
	opener.hidden = false;
	for(const button of example.querySelectorAll("[data-dialog-close]")) {
		button.hidden = false;
	}
	opener.addEventListener("click", () => {
		dialog.returnValue = "";
		dialog.showModal();
	});
	dialog.addEventListener("close", () => {
		const status = example.querySelector("[data-dialog-status]");
		if(status) {
			const action = Array.from(dialog.querySelectorAll("button[value]")).find(button => button.value === dialog.returnValue);
			status.textContent = action?.dataset.dialogResult || "Dialog dismissed. No data was changed.";
		}
		opener.focus();
	});
}

for(const example of document.querySelectorAll("[data-progress-example]")) {
	const button = example.querySelector("[data-progress-step]");
	const progress = example.querySelector("progress");
	const status = example.querySelector("[data-progress-status]");
	button.hidden = false;
	button.addEventListener("click", () => {
		progress.value = progress.value === progress.max ? 0 : Math.min(progress.value + 20, progress.max);
		status.textContent = `${progress.value}% complete`;
		button.textContent = progress.value === progress.max ? "Reset example" : "Advance example by 20%";
	});
}

for(const example of document.querySelectorAll("[data-copy-example]")) {
	const button = example.querySelector("[data-copy-button]");
	const status = example.querySelector("[data-copy-status]");
	if(!navigator.clipboard?.writeText) {
		continue;
	}
	button.hidden = false;
	button.addEventListener("click", async () => {
		try {
			await navigator.clipboard.writeText(example.querySelector("pre").textContent);
			status.textContent = "Code copied.";
		}
		catch {
			status.textContent = "Copy was unavailable. Select the code and copy it manually.";
		}
	});
}

for(const example of document.querySelectorAll("[data-action-example]")) {
	const button = example.querySelector("[data-action-button]");
	button.hidden = false;
	button.addEventListener("click", () => {
		example.querySelector("[data-action-status]").textContent = "Destructive action preview. No data has been changed.";
	});
}

for(const example of document.querySelectorAll("[data-metric-example]")) {
	const output = example.querySelector("output");
	for(const button of example.querySelectorAll("[data-metric-step]")) {
		button.hidden = false;
		button.addEventListener("click", () => {
			output.value = String(Number(output.value) + Number(button.dataset.metricStep));
		});
	}
}
for(const example of document.querySelectorAll("[data-row-example]")) {
	for(const button of example.querySelectorAll("[data-row-toggle]")) {
		button.hidden = false;
		button.addEventListener("click", () => {
			const row = button.closest("li");
			const complete = row.dataset.complete !== "true";
			row.dataset.complete = String(complete);
			button.textContent = complete ? "Reopen" : "Mark complete";
			example.nextElementSibling.textContent = complete ? "Task marked complete." : "Task reopened.";
		});
	}
}
for(const example of document.querySelectorAll("[data-search-example]")) {
	const input = example.querySelector("input");
	input.disabled = false;
	const update = () => {
		let count = 0;
		for(const item of example.querySelectorAll("li")) {
			item.hidden = !item.textContent.toLowerCase().includes(input.value.trim().toLowerCase());
			if(!item.hidden) count++;
		}
		example.querySelector("[data-result-status]").textContent = count ? `${count} matching topics.` : "No topics match your search.";
	};
	input.addEventListener("input", update);
	update();
}
for(const example of document.querySelectorAll("[data-state-example]")) {
	const panel = example.querySelector(".demo-state-panel");
	const status = example.querySelector("[data-state-status]");
	for(const button of example.querySelectorAll("button")) button.hidden = false;
	for(const [selector, attribute, label] of [["[data-busy-toggle]", "aria-busy", "Busy"], ["[data-drag-toggle]", "data-dragging", "Dragging"]]) {
		const button = example.querySelector(selector);
		button.addEventListener("click", () => {
			const active = panel.getAttribute(attribute) !== "true";
			panel.setAttribute(attribute, String(active));
			button.setAttribute("aria-pressed", String(active));
			status.textContent = `${label} preview ${active ? "enabled" : "disabled"}.`;
		});
	}
	example.querySelector("[data-reveal-replay]").addEventListener("click", () => {
		panel.style.setProperty("--theme-reveal-progress", "0");
		requestAnimationFrame(() => requestAnimationFrame(() => panel.style.setProperty("--theme-reveal-progress", "1")));
		status.textContent = "Reveal replayed. Reduced motion preferences are respected.";
	});
}

// Progressive navigation enhancement: links remain visible without JavaScript.
for(const toggle of document.querySelectorAll("[data-navigation-toggle]")) {
	const links = document.getElementById(toggle.getAttribute("aria-controls"));
	if(!links) continue;
	toggle.hidden = false;
	const collapse = () => {
		toggle.focus();
		toggle.setAttribute("aria-expanded", "false");
	};
	toggle.addEventListener("click", () => {
		toggle.setAttribute("aria-expanded", String(toggle.getAttribute("aria-expanded") !== "true"));
	});
	toggle.parentElement.addEventListener("keydown", event => {
		if(event.key === "Escape" && getComputedStyle(toggle).display !== "none") {
			collapse();
			event.preventDefault();
		}
	});
	window.addEventListener("resize", () => {
		const mobile = getComputedStyle(toggle).display !== "none";
		if(mobile && links.contains(document.activeElement)) toggle.setAttribute("aria-expanded", "true");
		else if(!mobile && document.activeElement === toggle) links.querySelector("a")?.focus();
	});
	links.addEventListener("click", event => {
		if(event.target.closest("a") && getComputedStyle(toggle).display !== "none") collapse();
	});
}
