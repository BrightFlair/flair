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
	--theme-grid-columns: 3;
}
```

New HTML pages are routed by WebEngine without registration. Optional PHP page logic can live beside the HTML. The directory's common logic supplies a title from the page heading and removes only the website footer; add your own footer inside your experiment when needed.

Your experiment controls its own dimensions, positioning and spacing. The website section switcher and footer reserve no space and are not rendered here. The introductory spacing on `/playground/` is scoped to that index alone.

## Extracted projects

The Authwave site lives in `~/Code/Authwave/www.authwave.com` and consumes Flair through a local npm dependency. Its pages, fonts and application styles are maintained there. The checklist pattern and highlight decoration it uses are part of Flair.

## Application layout proofs

- `/playground/documentation-website/`: a centred 96rem frame, 17rem navigation rail and a separate 54rem article cap. The rail becomes sticky at 60rem.
- `/playground/dashboard-app/`: a left-aligned 18rem rail at 60rem, with fluid summary grids and a scrollable data table filling the remaining width.
- `/playground/github-clone/`: a full-width top bar, left-aligned 24rem rail at 46rem and wrapping editor/preview panels capped independently at 48rem including their gutters. Choose GitHub in the theme selector to use Flair's preset.

Each example starts with the currently selected theme (Monochrome for a fresh session). The shared playground controls independently switch the six themes and System/Light/Dark colour scheme, persisting both selections; the Apply button supplies a native GET fallback without JavaScript.

### What the proofs establish

The three horizontal models are layout configuration, independent of the theme.
`flair.application-shell` takes sidebar and content selectors plus a breakpoint,
so an existing custom element is bound without adding a library class: one
column on narrow screens, an explicitly sized sidebar and fluid content on wide
ones, with the desktop sidebar sticky and scrolling within the viewport.
`%l-page-frame` accepts `--theme-page-margin` (`auto` by default; `0` for a
capped, left-aligned frame), and `%l-sidebar` handles intrinsic wrapping where
neither column should be fixed.

No example defines a palette. Application selectors extend Flair definitions in
SCSS, and the region class names describe parts of the application rather than
styling utilities.

The proofs demonstrate structural composition and theme independence. They are
not reproductions of any particular application, and each keeps its navigation
visible on narrow screens rather than copying a specific mobile menu. Theme
fonts, leading, borders and spacing change wrapping and height, so alignment and
width constraints stay owned by the application's own SCSS.

### Migrating an application onto Flair

Keep the existing markup, component behaviour and selectors wherever possible.
Include `flair.defaults` and one theme at the application root, then replace
layout and component rules a region at a time. A palette that does not match a
preset becomes a theme mixin in the application's own SCSS, mapping its colours
onto the nine palette slots. Compare representative pages, menu and dialog
states, and narrow and wide screenshots, before removing the old CSS.

Two things need particular attention. An application that sets its own root
font size keeps it in its own configuration, because media-query `rem` values
follow the browser's initial size rather than that override. And where an
application signals current state with a class, it moves to `aria-current`,
which is what the navigation definitions read.

Run `NODE_PATH=/tmp/flair-review/node_modules node test/playground-browser-check.cjs` against the local server for all three examples in all six themes at 320, 768, 1440 and 1920px, desktop accessibility scans, theme persistence, native form/disclosure behaviour and the no-JavaScript theme fallback. Browser tooling uses the optional setup described in [library.md](library.md).

The documentation and dashboard sidebars extend `%d-sidebar-contrast`. Their contrast is requested semantically in SCSS; the active theme defines the background, text and navigation states together. The Github clone retains the ordinary sidebar treatment. No styling classes or attributes are needed in the HTML.

The documentation sidebar also includes `flair.sidebar-bleed($from: 60rem)`. On wide screens its active theme surface extends through the outer page gutter to the left viewport edge, while its content stays inside the centred frame. The other playground sidebars do not opt in.
