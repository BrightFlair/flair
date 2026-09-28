for(const playground of document.querySelectorAll(".settings-pages")) {
	const links = Array.from(playground.querySelectorAll("[data-settings-view-link]"));
	const views = Array.from(playground.querySelectorAll("[data-settings-view]"));
	const select = playground.querySelector("[data-settings-view-select]");
	const menuButton = playground.querySelector("[data-settings-menu-toggle]");
	const knownViews = new Set(views.map(view => view.dataset.settingsView));

	const showView = requestedView => {
		const view = knownViews.has(requestedView) ? requestedView : "appearance";
		playground.dataset.settingsCurrent = view;
		for(const element of views) element.hidden = element.dataset.settingsView !== view;
		for(const link of links) {
			if(link.dataset.settingsViewLink === view) link.setAttribute("aria-current", "page");
			else link.removeAttribute("aria-current");
		}
		if(select) select.value = view;
		document.title = `${view === "appearance" ? "Appearance" : "Integrations"} — Flair playground`;
	};

	const viewFromLocation = () => showView(location.hash.slice(1));
	window.addEventListener("hashchange", viewFromLocation);
	select?.addEventListener("change", () => { location.hash = select.value; });
	menuButton?.addEventListener("click", () => {
		const open = playground.dataset.menuOpen !== "true";
		playground.dataset.menuOpen = String(open);
		menuButton.setAttribute("aria-expanded", String(open));
		menuButton.querySelector(".visually-hidden").textContent = open ? "Close navigation" : "Open navigation";
	});
	for(const link of links) link.addEventListener("click", () => {
		playground.dataset.menuOpen = "false";
		menuButton?.setAttribute("aria-expanded", "false");
	});
	viewFromLocation();
}
