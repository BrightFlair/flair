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

## Application layout proofs

- `/playground/documentation-website/`: a centred 96rem frame, 17rem navigation rail and a separate 54rem article cap. The rail becomes sticky at 60rem.
- `/playground/dashboard-app/`: a left-aligned 18rem rail at 60rem, with fluid summary grids and a scrollable data table filling the remaining width.
- `/playground/github-clone/`: a full-width top bar, left-aligned 24rem rail at 46rem and wrapping editor/preview panels capped independently at 48rem including their gutters. Choose GitHub in the theme selector to use Flair's existing preset.

Each example starts with the currently selected theme (Monochrome for a fresh session). The shared playground controls independently switch the six themes and System/Light/Dark colour scheme, persisting both selections; the Apply button supplies a native GET fallback without JavaScript. No example defines a palette. Application selectors extend Flair components in SCSS; the summary and workspace class names describe application regions, not styling utilities.

### Findings before migration

The three horizontal models belong to layout configuration, independently of the theme. `flair.application-shell` takes sidebar/content selectors and a breakpoint, so an existing custom element can be bound without adding a library class. It uses a single column on narrow screens and an explicitly sized sidebar plus fluid content on wide screens. The desktop sidebar scrolls within the viewport and stays sticky. `%l-page-frame` now accepts `--flair-page-margin` (default `auto`; use `0` for a capped, left-aligned frame). Existing `%l-sidebar` remains available for intrinsic wrapping.

The source review also identified work that these generic proofs do not claim to finish:

- **Documentation website:** retain its local Ubuntu typography, lavender navigation surface, syntax colours, search, scroll-triggered header and mobile navigation overlay. Map its palette to Flair theme properties in a local theme mixin; keep the centred outer frame separate from the article width. Its navigation background extends into the left viewport gutter, which remains an application decoration.
- **Dashboard app:** retain its local blue accents, dark navigation surface, responsive 16/18/20/24px type scale, mobile menu, chart/gauge rendering and live/stale states. Theme chart colours through inherited properties as well as HTML controls. Preserve the app's data and event hooks while replacing card, table and navigation styling. The example demonstrates the fluid layout with generic summaries rather than recreating domain-specific visualisations.
- **Github clone:** consume `theme.github` from Flair, preserving the existing 14px root size in application configuration. Preserve its navigation, drag ordering, editor state and modal behaviour. The shared GitHub theme now supplies light and dark palettes, following the system preference unless html data-theme explicitly selects light or dark. Its dark rendering still needs comparison with the source during migration. Check sidebar current-item styling and compact panel spacing against the source before replacing those rules.

The examples keep navigation visible on narrow screens. They prove structural composition and theme independence, not exact reproduction of the reference applications' mobile menus. Theme fonts, line heights, borders and spacing may change wrapping and height; the chosen alignment and width constraints stay owned by the application SCSS.

For the eventual migrations, keep existing markup, component behaviour and selectors wherever possible. Include Flair defaults and one theme at the application root, then replace layout/component rules incrementally. Put the two custom themes in their applications' own SCSS. Compare representative pages, menu/dialog states and narrow/wide screenshots before removing old CSS. No reference application source was edited in this pass.

Run `NODE_PATH=/tmp/flair-review/node_modules node test/playground-browser-check.cjs` against the local server for all three examples in all six themes at 320, 768, 1440 and 1920px, desktop accessibility scans, theme persistence, native form/disclosure behaviour and the no-JavaScript theme fallback. Browser tooling uses the optional setup described in [library.md](library.md).

The documentation and dashboard sidebars extend `%d-sidebar-contrast`. Their contrast is requested semantically in SCSS; the active theme defines the background, text and navigation states together. The Github clone retains the ordinary sidebar treatment. No styling classes or attributes are needed in the HTML.

The documentation sidebar also includes `flair.sidebar-bleed($from: 60rem)`. On wide screens its active theme surface extends through the outer page gutter to the left viewport edge, while its content stays inside the centred frame. The other playground sidebars do not opt in.
