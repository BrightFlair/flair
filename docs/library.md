# Flair library reference

This pass implements all ten documentation sections. It is a set of Sass definitions, with a separate example website. Importing `style/flair.scss` emits no CSS, fonts or JavaScript. Each live example provides its HTML and Sass under **HTML and Sass**.

## Using the library

```scss
@use "flair";

:root {
	@include flair.defaults;
	--flair-font-body: "Ubuntu", sans-serif;
	--flair-grid-columns: 3;
}

.project-list {
	@extend %p-grid;
}

.project-summary {
	@extend %o-card;
}
```

Configure your Sass load path to include Flair's `style` directory. Load fonts in the implementing application. Theme presets currently belong to `style/site/themes.scss`, not the public entry point; copy the relevant `--flair-*` overrides into an application theme. `--site-*` properties, section switching, cookies and demo scripts are website responsibilities.

`@extend` emits the dependencies of the requested definition. Sass does not inspect HTML to prune unused descendant rules. Keep selectors narrow and prefer setting inherited properties over duplicating component CSS. Element typography and controls are opt-in mixins (`flair.typography` and `flair.controls`) that can be included inside an application selector.

## Layers and boundaries

- **Variable:** default values and optional inherited theme properties.
- **Decoration:** typography, heading, surface, focus and syntax treatments.
- **Element:** opt-in rules for semantic text and native form controls.
- **Object:** links, controls, cards, avatars, disclosures, dialogs, tables, notices, badges and code.
- **Pattern:** arrangements of objects: forms, grids, stacks, navigation, lists and accordions.
- **Layout:** sidebar/content, gallery, dashboard and reading compositions.
- **Component:** implementing applications bind these definitions to their own custom elements and markup. The website's `demo-*` selectors are example consumers, not required application class names.
- **Page:** the website sets its content width and documentation layout here.

## Width and responsive behaviour

Start with the narrow layout in the base rules. All width breakpoints use `min-width`, with enhancements ordered from smaller to larger thresholds. Choose thresholds where the content needs a different arrangement, rather than targeting named devices. The website uses 36rem, 45rem and 70rem thresholds. These media-query rem values follow the browser’s initial font size, not a theme’s root font-size override.

Prefer intrinsic grid sizing and flex wrapping for reusable components: available container space is more useful than screen size when the same component appears in a sidebar or nested layout. Queries for accessibility preferences, such as reduced motion or forced colours, are independent of this width-breakpoint convention.

Objects and form patterns do not impose application content widths. `%p-grid` uses available container width, not viewport breakpoints. `--flair-grid-columns` is a positive integer (default 3), `--flair-grid-min` is a positive length (default 16rem), and `--flair-grid-gap` is a nonnegative length (default space 6). The grid can produce fewer columns when constrained; a final incomplete row retains the established column widths. Child content can wrap without enlarging its track.

`%l-sidebar` expects a direct `aside` and `.layout-content`. They wrap in source order; neither needs absolute positioning or a matching margin offset. `--flair-sidebar-width` and `--flair-content-min` set preferred sizes. `%l-article` intentionally limits reading measure with `--flair-prose-measure` (65ch); `%p-prose` itself remains fluid.

The website caps library content at 80rem, with gutters outside that measure. At the GitHub theme's 14px root that is 1120px, and at a 16px root it is 1280px. Demo narrow containers and compact/four-column variants are local examples, not library defaults.

## Markup contracts

| Definition | Structure and behaviour |
| --- | --- |
| `%p-prose` | A text container with semantic headings, paragraphs, lists, quotations and links. Heading order still belongs to the document. |
| `%o-card` | Any suitable container; direct headings, optional image and footer. Card width belongs to its parent. |
| `%o-avatar` | Image or initials. Give images appropriate alt text; hide initials when a visible name already conveys identity. |
| `%p-data-list` | `dl > div > dt + dd`; groups wrap into available columns. |
| `%p-list` | A `ul` or `ol` with direct `li` children; separators only between items. |
| `%p-navigation`, `%p-side-navigation`, `%p-page-tabs` | `nav > ul > li > a`. Set `aria-current="page"` or `"location"` only on the current destination; omit it on other links. Page tabs are links, not ARIA tab widgets. |
| `%p-breadcrumbs` | `nav > ol > li`; explicit `.separator` spans use `aria-hidden="true"`. Current item can be plain text. |
| `%p-pagination` | Navigation structure; unavailable destinations are `span` elements, not actionable links. Give the nav an accessible label. |
| `%o-disclosure`, `%p-accordion` | `details > summary + .disclosure-content`; accordion container has direct details children. Native markers and keyboard behaviour are retained. A shared `name` enables exclusive groups in supporting browsers. |
| `%o-dialog` | Native `dialog` with an accessible heading. Styling never forces a closed dialog to display. The website shows it inline before enhancement; `showModal()` supplies top-layer placement and focus containment. |
| `%o-table`, `%p-table-scroll` | A semantic table inside a named, focusable scroll region. Use caption and scoped headers. `.numeric` aligns numeric cells without changing their semantics. |
| `%o-notice` variants | A container with a visible status heading. Initial static notices are not live alerts. Application code decides when an announcement is appropriate. |
| `%o-badge` | Noninteractive text label. Its shape alone must not imply an action. |
| `%o-progress` | Labelled native `progress` with `value` and `max`; the example separately announces changes in a polite status region. |
| `%o-code-block`, `%d-syntax` | `pre > code` or `samp`. Mark up keyword/string/comment/number spans with `syntax-*` or the documented `hljs-*` classes. No parser is bundled. |
| `%l-gallery` | Direct `figure` children containing images and captions. Intrinsic image dimensions avoid layout shifts. |
| `%l-dashboard` | Optional header, `.metrics > article`, then other content such as a table. Data is supplied by the application. |

Forms retain the wrapping-label contract documented in [forms.md](forms.md). IDs are used where error summaries or help/error descriptions need a target. A style cannot disable an anchor; use a native disabled button or noninteractive text when no destination is available.

## Themes

| Theme | Intended differences |
| --- | --- |
| Monochrome | Ubuntu, straight corners, unshadowed surfaces and neutral states. |
| Dark | Dark raised surfaces, light current-item treatment and light code text. |
| Paper | Serif headings, generous spacing and leading, warm inset areas and subtle shadows. |
| Vivid | Heavy borders, offset shadows, larger padding, lime selection, pill badges and dark code blocks. |
| GitHub | api.horse's light palette and Mona Sans; compact panels, coral navigation indicator, grey table stripes and GitHub-style syntax colours. |
| Material | Roboto, rounded elevated surfaces, tonal navigation, larger table padding and rounded badges. |

These are presentations of shared semantic markup, not complete replicas of GitHub or Material widgets. Native controls keep browser behaviour. There are no floating-label fields, ripple engine, custom tabs, custom select replacement or theme-specific HTML trees. All new theme differences use inherited CSS properties; local variants demonstrate overriding only a few values.

## Reference project mapping

Read-only references used for this pass:

| Existing source | Shared Flair definition |
| --- | --- |
| Hexform `style/decorator/card.scss`, `expandable-card.scss` | Surface decoration, card and disclosure objects; no application-specific positioning or hover transforms. |
| Hexform `style/layout/sidebar.scss` | Sidebar/content layout, with container wrapping instead of paired fixed widths and offsets. |
| api.horse `style/decoration/panel.scss` | Surface, disclosure and description-list pieces separated from panel widths and request-editor markup. |
| api.horse `style/object/page-layout.scss` | Container-driven layout patterns. |
| dhp-logging `style/decoration/card.scss`, `tabs.scss` | Card treatment and page navigation with current-state styling. Navigation remains visible at narrow widths. |
| dhp-logging `style/element/table.scss` | Table cell spacing and alternating rows, with semantic headers and contained scrolling. |
| www.php.gt `style/decoration/typography.scss`, `syntax.scss` | Scoped prose and explicit syntax colours; reading measure is a separate layout decision. |

No implementing project has been modified or migrated in this pass. Project-specific interactions, fetching, authentication, validation and persistence are outside these definitions.

## Source inventory

Each file below can be imported independently, or reached through `flair.scss`. Dependencies are explicit `@use` statements in that file.

| File | Public definitions |
| --- | --- |
| [`style/decoration/control.scss`](../style/decoration/control.scss) | `%d-control` |
| [`style/decoration/flow.scss`](../style/decoration/flow.scss) | `%d-stack`, `%d-cluster` |
| [`style/decoration/focus-ring.scss`](../style/decoration/focus-ring.scss) | `%d-focus-ring` |
| [`style/decoration/surface.scss`](../style/decoration/surface.scss) | `%d-surface` |
| [`style/decoration/syntax.scss`](../style/decoration/syntax.scss) | `%d-syntax` |
| [`style/decoration/typography.scss`](../style/decoration/typography.scss) | `%d-typography`, `%d-heading` |
| [`style/element/controls.scss`](../style/element/controls.scss) | `@mixin controls` |
| [`style/element/typography.scss`](../style/element/typography.scss) | `@mixin typography` |
| [`style/object/avatar.scss`](../style/object/avatar.scss) | `%o-avatar` |
| [`style/object/badge.scss`](../style/object/badge.scss) | `%o-badge` |
| [`style/object/button.scss`](../style/object/button.scss) | `%o-button`, `%o-button-primary`, `%o-button-danger` |
| [`style/object/card.scss`](../style/object/card.scss) | `%o-card`, `%o-inset` |
| [`style/object/code.scss`](../style/object/code.scss) | `%o-code`, `%o-key`, `%o-code-block` |
| [`style/object/control.scss`](../style/object/control.scss) | `%o-control`, `%o-choice`, `%o-range`, `%o-color` |
| [`style/object/dialog.scss`](../style/object/dialog.scss) | `%o-dialog` |
| [`style/object/disclosure.scss`](../style/object/disclosure.scss) | `%o-disclosure` |
| [`style/object/form-field.scss`](../style/object/form-field.scss) | `%o-form-field`, `%o-choice-field`, `%o-fieldset` |
| [`style/object/link.scss`](../style/object/link.scss) | `%o-link` |
| [`style/object/nav-link.scss`](../style/object/nav-link.scss) | `%o-nav-link` |
| [`style/object/notice.scss`](../style/object/notice.scss) | `%o-notice`, `%o-notice-success`, `%o-notice-warning`, `%o-notice-danger` |
| [`style/object/progress.scss`](../style/object/progress.scss) | `%o-progress` |
| [`style/object/table.scss`](../style/object/table.scss) | `%o-table` |
| [`style/pattern/accordion.scss`](../style/pattern/accordion.scss) | `%p-accordion` |
| [`style/pattern/breadcrumbs.scss`](../style/pattern/breadcrumbs.scss) | `%p-breadcrumbs` |
| [`style/pattern/data-list.scss`](../style/pattern/data-list.scss) | `%p-data-list`, `%p-list` |
| [`style/pattern/empty-state.scss`](../style/pattern/empty-state.scss) | `%p-empty-state` |
| [`style/pattern/field-row.scss`](../style/pattern/field-row.scss) | `%p-field-row` |
| [`style/pattern/form-actions.scss`](../style/pattern/form-actions.scss) | `%p-form-actions` |
| [`style/pattern/form-fields.scss`](../style/pattern/form-fields.scss) | `%p-form-fields` |
| [`style/pattern/grid.scss`](../style/pattern/grid.scss) | `%p-grid` |
| [`style/pattern/navigation.scss`](../style/pattern/navigation.scss) | `%p-navigation`, `%p-side-navigation`, `%p-page-tabs` |
| [`style/pattern/pagination.scss`](../style/pattern/pagination.scss) | `%p-pagination` |
| [`style/pattern/prose.scss`](../style/pattern/prose.scss) | `%p-prose` |
| [`style/pattern/stack.scss`](../style/pattern/stack.scss) | `%p-stack`, `%p-cluster` |
| [`style/pattern/table-scroll.scss`](../style/pattern/table-scroll.scss) | `%p-table-scroll` |
| [`style/layout/article.scss`](../style/layout/article.scss) | `%l-article` |
| [`style/layout/dashboard.scss`](../style/layout/dashboard.scss) | `%l-dashboard` |
| [`style/layout/gallery.scss`](../style/layout/gallery.scss) | `%l-gallery` |
| [`style/layout/sidebar.scss`](../style/layout/sidebar.scss) | `%l-sidebar` |

## Property reference

The defaults mixin defines the foundational values listed in [forms.md](forms.md). The optional properties below are consumed with fallbacks and are not reset on each object. CSS `var()` expressions show the next fallback; the chain eventually reaches the foundational value or literal. Multiple fallbacks indicate use in more than one context. Shape, spacing, typography and colour overrides remain inherited.

| Property | Fallbacks used by definitions |
| --- | --- |
| `--flair-accordion-gap` | `var(--flair-space-2)` |
| `--flair-actions-align` | `flex-end` |
| `--flair-actions-gap` | `var(--flair-space-3)` |
| `--flair-actions-margin` | `var(--flair-space-2)` |
| `--flair-avatar-radius` | `50%` |
| `--flair-avatar-size` | `3rem` |
| `--flair-badge-background` | `var(--flair-color-surface-disabled)` |
| `--flair-badge-border` | `var(--flair-color-border)` |
| `--flair-badge-padding-block` | `var(--flair-space-1)` |
| `--flair-badge-padding-inline` | `var(--flair-space-2)` |
| `--flair-badge-radius` | `var(--flair-radius)` |
| `--flair-badge-text` | `var(--flair-color-text)` |
| `--flair-button-background` | `var(--flair-color-surface)` |
| `--flair-button-background-hover` | `var(--flair-color-surface-disabled)` |
| `--flair-button-font-size` | `var(--flair-font-size)` |
| `--flair-button-min-height` | `var(--flair-control-min-height)` |
| `--flair-button-primary-background` | `var(--flair-color-accent)` |
| `--flair-button-primary-background-hover` | `var(--flair-color-text)` |
| `--flair-button-primary-decoration-hover` | `underline` |
| `--flair-button-primary-text` | `var(--flair-color-on-accent)` |
| `--flair-button-shadow-hover` | `none` |
| `--flair-button-text` | `var(--flair-color-text)` |
| `--flair-button-weight` | `var(--flair-label-weight)` |
| `--flair-card-title-size` | `1.25rem` |
| `--flair-cluster-gap` | `var(--flair-space-3)` |
| `--flair-code-background` | `var(--flair-color-surface-disabled)` |
| `--flair-code-leading` | `1.6` |
| `--flair-code-padding` | `var(--flair-space-6)` |
| `--flair-code-radius` | `var(--flair-radius)` |
| `--flair-code-size` | `0.95em` |
| `--flair-code-tab-size` | `4` |
| `--flair-code-text` | `var(--flair-color-text)` |
| `--flair-color-control-width` | `4rem` |
| `--flair-color-success` | `var(--flair-color-text)` |
| `--flair-color-warning` | `var(--flair-color-text)` |
| `--flair-content-min` | `28rem` |
| `--flair-control-background` | `var(--flair-color-surface)` |
| `--flair-control-background-focus` | `var(--flair-control-background, var(--flair-color-surface))` |
| `--flair-control-border` | `var(--flair-color-border)` |
| `--flair-control-border-hover` | `var(--flair-color-text)` |
| `--flair-control-focus-offset` | `var(--flair-focus-offset)` |
| `--flair-control-invalid-border-style` | `dashed` |
| `--flair-control-padding-block` | `var(--flair-space-2)` |
| `--flair-control-padding-inline` | `var(--flair-space-3)` |
| `--flair-control-radius` | `var(--flair-radius)` |
| `--flair-control-text` | `var(--flair-color-text)` |
| `--flair-control-text-disabled` | `var(--flair-color-muted)` |
| `--flair-danger-background-hover` | `var(--flair-color-danger)` |
| `--flair-danger-text-hover` | `var(--flair-color-surface)` |
| `--flair-dialog-backdrop` | `rgb(0 0 0 / 55%)` |
| `--flair-dialog-width` | `32rem` |
| `--flair-disabled-opacity` | `1` |
| `--flair-disclosure-background` | `transparent` |
| `--flair-disclosure-padding` | `var(--flair-space-4)` |
| `--flair-empty-padding` | `var(--flair-space-8)` |
| `--flair-field-gap` | `var(--flair-space-2)` |
| `--flair-fieldset-padding` | `var(--flair-space-4)` |
| `--flair-focus-color` | `var(--flair-color-accent)` |
| `--flair-font-heading` | `var(--flair-font-body)` |
| `--flair-font-mono` | `"Ubuntu Mono", monospace` |
| `--flair-form-gap` | `var(--flair-space-4)` |
| `--flair-gallery-ratio` | `4 / 3` |
| `--flair-grid-columns` | `3` |
| `--flair-grid-gap` | `var(--flair-space-6)` |
| `--flair-grid-min` | `16rem` |
| `--flair-heading-1` | `2.5rem` |
| `--flair-heading-2` | `2rem` |
| `--flair-heading-3` | `1.5rem` |
| `--flair-heading-4` | `1.25rem` |
| `--flair-heading-leading` | `1.15` |
| `--flair-heading-tracking` | `normal` |
| `--flair-heading-weight` | `500` |
| `--flair-inset-background` | `var(--flair-color-surface-disabled)` |
| `--flair-label-font-size` | `var(--flair-font-size)` |
| `--flair-layout-gap` | `var(--flair-space-6)` |
| `--flair-link-hover-thickness` | `var(--flair-link-thickness, 1px)` |
| `--flair-link-offset` | `0.2em` |
| `--flair-link-thickness` | `1px` |
| `--flair-message-font-size` | `var(--flair-font-size)` |
| `--flair-nav-current-shadow` | `inset 0 -3px var(--flair-color-accent)` |
| `--flair-nav-current-weight` | `700` |
| `--flair-nav-gap` | `var(--flair-space-2)` |
| `--flair-nav-hover-background` | `var(--flair-color-surface-disabled)` |
| `--flair-nav-padding-block` | `var(--flair-space-3)` |
| `--flair-nav-padding-inline` | `var(--flair-space-4)` |
| `--flair-nav-radius` | `var(--flair-radius)` |
| `--flair-notice-border-width` | `4px` |
| `--flair-notice-color` | `var(--flair-color-accent)` |
| `--flair-progress-height` | `0.75rem` |
| `--flair-prose-measure` | `65ch` |
| `--flair-quote-border-width` | `4px` |
| `--flair-selected-background` | `var(--flair-color-surface-disabled)` |
| `--flair-selected-text` | `var(--flair-color-text)` |
| `--flair-sidebar-width` | `16rem` |
| `--flair-small-size` | `0.875rem` |
| `--flair-stack-gap` | `var(--flair-space-4)` |
| `--flair-surface-background` | `var(--flair-color-surface)` |
| `--flair-surface-border-width` | `var(--flair-border-width)` |
| `--flair-surface-padding` | `var(--flair-space-6)` |
| `--flair-surface-radius` | `var(--flair-radius)` |
| `--flair-surface-shadow` | `none` |
| `--flair-syntax-comment` | `var(--flair-color-muted)` |
| `--flair-syntax-keyword` | `var(--flair-color-accent)` |
| `--flair-syntax-number` | `var(--flair-color-accent)` |
| `--flair-syntax-string` | `var(--flair-color-text)` |
| `--flair-table-header-background` | `var(--flair-color-surface-disabled)` |
| `--flair-table-hover-background` | `var(--flair-color-surface-disabled)` |
| `--flair-table-padding-block` | `var(--flair-space-3)` |
| `--flair-table-padding-inline` | `var(--flair-space-4)` |
| `--flair-table-stripe-background` | `transparent` |
| `--flair-text-leading` | `1.6` |

## Verification and review

Run `npm test` for Sass API checks and `gt build` for client compilation. The browser review covers all ten sections in all six themes at 320px, 768px and 1440px, plus native disclosure/dialog behaviour, progress updates, copy success/failure, theme persistence and no-JavaScript fallback. Automated accessibility checks supplement, rather than replace, keyboard and visual review.

Useful manual checks: open source listings, tab through every control, resize nested grids, scroll the narrow table with a keyboard, open a dialog and dismiss it with Escape, switch themes while a dialog is open, and compare narrow-screen layouts at enlarged text sizes. Test native controls in the browsers your application supports before adoption.

Behaviour references: [native details](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details), [native dialogs](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [CSS grid](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids). Material theme references remain documented in [forms.md](forms.md).

### Running the optional browser checks

Keep browser tooling outside the library's dependencies:

```sh
npm install --prefix /tmp/flair-review playwright @axe-core/playwright
NODE_PATH=/tmp/flair-review/node_modules node test/browser-check.cjs
```

Start the Flair website on port 8084 first (`gt run -p 8084`). Set `FLAIR_TEST_URL` for another address and `FLAIR_CHROMIUM_PATH` for another Chromium executable. The script defaults to `/usr/bin/chromium`. It checks 180 page/theme/width combinations, runs axe on all 60 page/theme combinations at desktop width, and exercises the example interactions. Clipboard tests simulate both success and permission failure; they do not read your clipboard.

## Dialog examples

The Disclosures page includes a simple close action, primary/negative choices, and a required-field form. All use the same dialog object. Native `method="dialog"` submission closes the dialog without a network request; required fields prevent submission until valid. A cancel submitter uses `formnovalidate` so incomplete input does not prevent dismissal. Escape remains available.

The website reveals all example actions after enhancement, resets `returnValue` before reopening, and reports each choice in a status region outside the dialog. Focus returns to its own opener. Without JavaScript, the three dialogs remain inline previews with modal action controls hidden. These behaviours belong to `script/component/library-example.es6`, not to the Sass library.

## Checklist pattern

`%p-checklist` is defined in `style/pattern/checklist.scss`. Use it on a list with a `.checklist-marker` and text in each direct list item. Markers carry explicit accessible labels such as “Included” or “Not included”; the latter can also set `data-available="false"` on the item for a secondary marker treatment. These are informational markers, not checkbox controls.

```html
<ul class="plan-features">
	<li>
		<span class="checklist-marker" role="img" aria-label="Included">✓</span>
		<span>User management</span>
	</li>
	<li data-available="false">
		<span class="checklist-marker" role="img" aria-label="Not included">×</span>
		<span>Managed hosting</span>
	</li>
</ul>
```

```scss
@use "flair";

.plan-features {
	@extend %p-checklist;
}
```

`--flair-checklist-gap` defaults to space 4; `--flair-checklist-marker-size` defaults to 1.25rem. Marker colours inherit the existing text, surface, disabled-surface and muted tokens. The separate Authwave website uses this pattern without adding pricing-specific behaviour to Flair.

## Local npm consumption

An implementing project can require `"flair": "file:../../BrightFlair/flair"` in `package.json`, adjusting the relative path to its checkout. Run `npm install`, then add `node_modules/flair/style` to the Sass load path. WebEngine projects can override the Sass command in `build.ini`:

```ini
[style/**/*.scss]
execute=./node_modules/.bin/sass --load-path=node_modules/flair/style ./style/style.scss www/style.css --source-map --embed-sources --embed-source-map
```

Use `@use "flair";` in consuming modules. The package contains only the public Sass entry and library directories. Application fonts, navigation scripts and website themes are not included. Rebuild the implementing project after editing Flair.

## Highlight decoration

`%d-highlight` draws a border with four square markers outside its corners. It uses `::before`, which must remain available, and leaves layout decisions to the consumer. Use `display: inline-block` for inline text so wrapping produces one enclosing box. Ancestors must allow overflow for the external markers to remain visible.

```scss
@use "flair";

.highlight {
	@extend %d-highlight;
	display: inline-block;
	max-inline-size: 100%;
}
```

`--flair-highlight-marker-size` defaults to `0.375rem`. `--flair-highlight-border-width` and `--flair-highlight-border-color` fall back to the standard border tokens. Markers use `currentColor`; they do not intercept pointer events.
