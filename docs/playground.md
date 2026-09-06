# Playground

Open `/playground/` from the global section selector. `/playground/blank/` is a blank starter: its main element fills the viewport height and has no padding, margin or maximum width. Playground pages keep the shared fonts, theme variables, baseline element styles, and skip link. The section switcher is removed on every playground page. They do not use `.library-page` or `.flair-example`, and the website footer is removed within this directory.

To add an experiment:

1. Copy `page/playground/blank.html` to `page/playground/my-layout.html` and give its main element a unique class. Keep `id="main-content"` for the skip link.
2. Create `style/playground/my-layout.scss`, import `../flair`, and extend placeholders onto selectors scoped to that experiment.
3. Add `@use "my-layout";` near the top of `style/playground/index.scss`.
4. Run `gt build` and visit `/playground/my-layout/`. Add a link on the playground index if you want it listed there.

```scss
@use "../flair";

.my-layout {
	@extend %p-grid;
	--flair-grid-columns: 3;
}
```

New HTML pages are routed by WebEngine without registration. Optional PHP page logic can live beside the HTML. The directory's common logic supplies a title from the page heading and removes only the website footer; add your own footer inside your experiment when needed.

Your experiment controls its own dimensions, positioning and spacing. The website section switcher and footer reserve no space and are not rendered here. The introductory spacing on `/playground/` is scoped to that index alone.

## Extracted projects

The Authwave experiment now lives in `~/Code/Authwave/www.authwave.com` and consumes Flair through a local npm dependency. Its page, fonts and application styles are maintained there. The shared checklist pattern and highlight decoration remain in Flair.
