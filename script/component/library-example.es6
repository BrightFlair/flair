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
