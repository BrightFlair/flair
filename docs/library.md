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

Configure your Sass load path to include Flair's `style` directory. Load fonts in the implementing application. Import `theme` separately with `@use "theme";` to access the opt-in `theme.base`, `theme.ink`, `theme.paper`, `theme.vivid`, `theme.github` and `theme.material` mixins. Include `theme.base` first, followed by one optional preset at the application root. Each theme supplies both light and dark colours; the scheme follows the browser unless `html[data-theme="light"]` or `html[data-theme="dark"]` overrides it. `--site-*` properties, section switching, cookies and demo scripts are website responsibilities.

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
| Ink | Neutral raised surfaces and a strong current-item treatment, with light and dark palettes. |
| Paper | Serif headings, generous spacing and leading, warm inset areas and subtle shadows. |
| Vivid | Heavy borders, offset shadows, larger padding, lime selection, pill badges and dark code blocks. |
| GitHub | the reference light palette, sans-serif navigation and Mona Sans controls; compact panels, neutral current navigation backgrounds, unmarked sidebar links, thin coral tab indicators, grey table stripes and GitHub-style syntax colours. |
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

Flux consumes the shared definitions, including the metric, actionable-list and search-result patterns. The other reference projects remain design references. Project-specific interactions, fetching, authentication, validation and persistence are outside these definitions.

## Source inventory

Each file below can be imported independently, or reached through `flair.scss`. Dependencies are explicit `@use` statements in that file. Each top-level placeholder lives in a matching file, without the layer prefix: `%d-stack` belongs in `decoration/stack.scss`. Nested selectors and encapsulated variants stay with their owner; unrelated placeholders get separate files. The same rule applies to mixins and website selectors: each definition file owns one root name, while descendants and variants stay nested under that owner. General mixins live in `mixin/<name>.scss` and theme mixins in `theme/<name>.scss`; each font file owns one family. Composition files contain only imports/forwards or the explicit document baseline include.

| File | Public definitions |
| --- | --- |
| [`style/decoration/cluster.scss`](../style/decoration/cluster.scss) | `%d-cluster` |
| [`style/decoration/control.scss`](../style/decoration/control.scss) | `%d-control` |
| [`style/decoration/focus-ring.scss`](../style/decoration/focus-ring.scss) | `%d-focus-ring` |
| [`style/decoration/highlight.scss`](../style/decoration/highlight.scss) | `%d-highlight` |
| [`style/decoration/stack.scss`](../style/decoration/stack.scss) | `%d-stack` |
| [`style/decoration/state.scss`](../style/decoration/state.scss) | `%d-state` (`&-busy`, `&-dragging`, `&-reveal`) |
| [`style/decoration/surface.scss`](../style/decoration/surface.scss) | `%d-surface` |
| [`style/decoration/syntax.scss`](../style/decoration/syntax.scss) | `%d-syntax` |
| [`style/decoration/typography.scss`](../style/decoration/typography.scss) | `%d-typography` (`&-heading`, `&-lead`, `&-eyebrow`) |
| [`style/decoration/visually-hidden.scss`](../style/decoration/visually-hidden.scss) | `%d-visually-hidden` |
| [`style/object/avatar.scss`](../style/object/avatar.scss) | `%o-avatar` |
| [`style/object/badge.scss`](../style/object/badge.scss) | `%o-badge` |
| [`style/object/button-danger.scss`](../style/object/button-danger.scss) | `%o-button-danger` |
| [`style/object/button-primary.scss`](../style/object/button-primary.scss) | `%o-button-primary` |
| [`style/object/button.scss`](../style/object/button.scss) | `%o-button` |
| [`style/object/card.scss`](../style/object/card.scss) | `%o-card` |
| [`style/object/choice-field.scss`](../style/object/choice-field.scss) | `%o-choice-field` |
| [`style/object/choice.scss`](../style/object/choice.scss) | `%o-choice` |
| [`style/object/code-block.scss`](../style/object/code-block.scss) | `%o-code-block` |
| [`style/object/code.scss`](../style/object/code.scss) | `%o-code` |
| [`style/object/color.scss`](../style/object/color.scss) | `%o-color` |
| [`style/object/control.scss`](../style/object/control.scss) | `%o-control` |
| [`style/object/dialog.scss`](../style/object/dialog.scss) | `%o-dialog` |
| [`style/object/disclosure.scss`](../style/object/disclosure.scss) | `%o-disclosure` |
| [`style/object/fieldset.scss`](../style/object/fieldset.scss) | `%o-fieldset` |
| [`style/object/form-field.scss`](../style/object/form-field.scss) | `%o-form-field` |
| [`style/object/inset.scss`](../style/object/inset.scss) | `%o-inset` |
| [`style/object/key.scss`](../style/object/key.scss) | `%o-key` |
| [`style/object/link.scss`](../style/object/link.scss) | `%o-link` |
| [`style/object/nav-link.scss`](../style/object/nav-link.scss) | `%o-nav-link` |
| [`style/object/notice-danger.scss`](../style/object/notice-danger.scss) | `%o-notice-danger` |
| [`style/object/notice-success.scss`](../style/object/notice-success.scss) | `%o-notice-success` |
| [`style/object/notice-warning.scss`](../style/object/notice-warning.scss) | `%o-notice-warning` |
| [`style/object/notice.scss`](../style/object/notice.scss) | `%o-notice` |
| [`style/object/progress.scss`](../style/object/progress.scss) | `%o-progress` |
| [`style/object/range.scss`](../style/object/range.scss) | `%o-range` |
| [`style/object/skip-link.scss`](../style/object/skip-link.scss) | `%o-skip-link` |
| [`style/object/table.scss`](../style/object/table.scss) | `%o-table` |
| [`style/object/value.scss`](../style/object/value.scss) | `%o-value` |
| [`style/pattern/accordion.scss`](../style/pattern/accordion.scss) | `%p-accordion` |
| [`style/pattern/action-list.scss`](../style/pattern/action-list.scss) | `%p-action-list` |
| [`style/pattern/action-row.scss`](../style/pattern/action-row.scss) | `%p-action-row` |
| [`style/pattern/breadcrumbs.scss`](../style/pattern/breadcrumbs.scss) | `%p-breadcrumbs` |
| [`style/pattern/checklist.scss`](../style/pattern/checklist.scss) | `%p-checklist` |
| [`style/pattern/cluster.scss`](../style/pattern/cluster.scss) | `%p-cluster` |
| [`style/pattern/data-list.scss`](../style/pattern/data-list.scss) | `%p-data-list` |
| [`style/pattern/empty-state.scss`](../style/pattern/empty-state.scss) | `%p-empty-state` |
| [`style/pattern/field-row.scss`](../style/pattern/field-row.scss) | `%p-field-row` |
| [`style/pattern/form-actions.scss`](../style/pattern/form-actions.scss) | `%p-form-actions` |
| [`style/pattern/form-fields.scss`](../style/pattern/form-fields.scss) | `%p-form-fields` |
| [`style/pattern/grid.scss`](../style/pattern/grid.scss) | `%p-grid` |
| [`style/pattern/list.scss`](../style/pattern/list.scss) | `%p-list` |
| [`style/pattern/metric.scss`](../style/pattern/metric.scss) | `%p-metric` |
| [`style/pattern/navigation.scss`](../style/pattern/navigation.scss) | `%p-navigation` |
| [`style/pattern/output-row.scss`](../style/pattern/output-row.scss) | `%p-output-row` |
| [`style/pattern/page-footer.scss`](../style/pattern/page-footer.scss) | `%p-page-footer` |
| [`style/pattern/page-header.scss`](../style/pattern/page-header.scss) | `%p-page-header` |
| [`style/pattern/page-intro.scss`](../style/pattern/page-intro.scss) | `%p-page-intro` |
| [`style/pattern/page-tabs.scss`](../style/pattern/page-tabs.scss) | `%p-page-tabs` |
| [`style/pattern/pagination.scss`](../style/pattern/pagination.scss) | `%p-pagination` |
| [`style/pattern/prose.scss`](../style/pattern/prose.scss) | `%p-prose` |
| [`style/pattern/search-results.scss`](../style/pattern/search-results.scss) | `%p-search-results` |
| [`style/pattern/side-navigation.scss`](../style/pattern/side-navigation.scss) | `%p-side-navigation` |
| [`style/pattern/stack.scss`](../style/pattern/stack.scss) | `%p-stack` |
| [`style/pattern/table-scroll.scss`](../style/pattern/table-scroll.scss) | `%p-table-scroll` |
| [`style/layout/article.scss`](../style/layout/article.scss) | `%l-article` |
| [`style/layout/dashboard.scss`](../style/layout/dashboard.scss) | `%l-dashboard` |
| [`style/layout/gallery.scss`](../style/layout/gallery.scss) | `%l-gallery` |
| [`style/layout/page-frame.scss`](../style/layout/page-frame.scss) | `%l-page-frame` |
| [`style/layout/sidebar.scss`](../style/layout/sidebar.scss) | `%l-sidebar` |
| [`style/mixin/base.scss`](../style/mixin/base.scss) | `@mixin base` |
| [`style/mixin/controls.scss`](../style/mixin/controls.scss) | `@mixin controls` |
| [`style/mixin/typography.scss`](../style/mixin/typography.scss) | `@mixin typography` |
| [`style/mixin/defaults.scss`](../style/mixin/defaults.scss) | `@mixin defaults` |
| [`style/mixin/sticky-sidebar.scss`](../style/mixin/sticky-sidebar.scss) | `@mixin sticky-sidebar` |
| [`style/theme/base.scss`](../style/theme/base.scss) | `@mixin base` |
| [`style/theme/ink.scss`](../style/theme/ink.scss) | `@mixin ink` |
| [`style/theme/paper.scss`](../style/theme/paper.scss) | `@mixin paper` |
| [`style/theme/vivid.scss`](../style/theme/vivid.scss) | `@mixin vivid` |
| [`style/theme/github.scss`](../style/theme/github.scss) | `@mixin github` |
| [`style/theme/material.scss`](../style/theme/material.scss) | `@mixin material` |

For direct module consumers, import the matching file for each placeholder (for example, `decoration/stack` and `decoration/cluster` replace `decoration/flow`; `decoration/visually-hidden` replaces `decoration/accessibility`). Direct mixin imports now use `mixin/<name>`: `mixin/defaults` replaces `variable`, `theme/<name>` replaces the old theme modules, and `mixin/base`, `mixin/controls` and `mixin/typography` replace the element modules. `sticky-sidebar` is imported from `mixin/sticky-sidebar`, separately from `layout/page-frame`. Importing `flair` exposes the general library definitions; themes have their own `theme` namespace. Import `theme` for all presets, or `theme/github` as `theme` for just `theme.github`. Sass uses a single module namespace, so the API is `theme.github`, not `flair.theme.github`. State extensions now use `%d-state-busy`, `%d-state-dragging` and `%d-state-reveal`.

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

Use `@use "flair";` in consuming modules. The package contains only the public Sass entry and library directories. Application fonts, navigation scripts and website-specific theme tokens are not included; public theme mixins are included. Rebuild the implementing project after editing Flair.

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

## Shared website patterns

These additions are public through `flair.scss`. Every example includes live HTML and its Sass source, and uses the global theme selector.

| Definitions | Interactive documentation | Markup and configuration |
| --- | --- | --- |
| `%o-value`, `%p-metric`, `%p-output-row` | Feedback → Values, totals and controls; Layouts → Dashboard | A metric has a heading, `output` or `.metric-value`, optional `.metric-detail`, and `.actions`. `--flair-metric-align` (center/start/end) aligns both value and controls. `--flair-value-size` (3rem), `--flair-value-weight` (700), `--flair-value-unit-size` (0.5em for a child `.metric-unit`), `--flair-value-leading` (1.2), `--flair-metric-gap` (space 4) and `--flair-output-label-size` (1.5rem) configure presentation. Announcements and units belong to the consumer. |
| `%p-action-row`, `%p-action-list` | Surfaces → Content with trailing actions | Lists contain `li`; rows contain `.row-content` and `.row-actions`, with optional leading content. Rows wrap in source order. `--flair-row-content-min` defaults to 8rem; row and action gaps use space 3 and space 2. `--flair-row-background` defaults to the surface colour. |
| `%p-search-results` | Navigation → Search result links | Ordinary `ul > li > a` links, with optional `.result-detail`. `--flair-results-max-height` defaults to none, `--flair-result-link-padding` to space 2 and `--flair-list-padding` to space 4. Filtering, announcements and requests are application behaviour. |
| `%l-page-frame`, `%p-page-header`, `%p-page-footer`, `sticky-sidebar($from: 70rem)` | Layouts → Page frame, header and footer | Frame width defaults to 90rem; `--flair-page-gutter` and `--flair-page-padding-block` default to space 6. Header/footer wrap their contents and use `--flair-header-padding-block` (space 4). Sticky sidebar is optional and uses `--flair-sticky-offset`; choose a threshold suitable for the composition. |
| `%p-page-intro`, `%d-typography-lead`, `%d-typography-eyebrow` | Typography → Page introductions | Direct h1/h2 or `.intro-title`, followed by a lead paragraph. Set `--flair-intro-title-size`, `--flair-intro-space`, `--flair-lead-size`, `--flair-lead-measure`, and `--flair-eyebrow-size/weight/tracking`. Document heading levels remain the consumer's responsibility. |
| `%o-skip-link`, `%d-visually-hidden` | Navigation → Skip links and visually hidden text | Real skip-link destination; hidden text must not contain invisible focusable controls. Skip links are visible on focus. `--flair-skip-link-layer` defaults to 100. |
| `%d-state-busy`, `%d-state-dragging`, `%d-state-reveal` | Feedback → Busy, dragging and reveal treatments | The `state.scss` file owns `%d-state`; its nested `&-busy`, `&-dragging` and `&-reveal` placeholders are extended as `%d-state-busy`, `%d-state-dragging` and `%d-state-reveal`. Apply them only to the relevant application state. Busy opacity defaults to .55, dragging opacity to .6, and drag outline width to 2px. Reveal progress is 0–1; minimum opacity .12, distance 1.5rem and duration 650ms. Reduced motion and print display revealed content immediately. |
| `base`, `typography`, `controls` | Code → An explicit document baseline | Mixins must be explicitly included. Base provides border-box sizing, body margin reset and `[hidden]` preservation. |
| `theme.base`, `theme.ink/paper/vivid/github/material` | Typography → Using the theme presets | Base supplies defaults; select one optional preset. Presets contain reusable tokens and colour-scheme, never website selectors, font downloads or JavaScript. |

`%p-data-list` now accepts `--flair-data-min` (14rem by default). A consumer can choose 100% for a single-column description list without replacing its typography or spacing rules.

Source files follow their layer: `object/value.scss`, `object/skip-link.scss`, `pattern/metric.scss`, `pattern/action-list.scss`, `pattern/search-results.scss`, `pattern/page-header.scss`, `pattern/page-intro.scss`, `layout/page-frame.scss`, `decoration/visually-hidden.scss`, `decoration/state.scss`, `mixin/base.scss`, `mixin/sticky-sidebar.scss` and the `theme/*.scss` files. Heading, lead and eyebrow definitions are nested under `%d-typography` in `decoration/typography.scss`, and extended as `%d-typography-heading`, `%d-typography-lead` and `%d-typography-eyebrow`.

Flux maps `--flux-first-visible` to `--flair-reveal-progress` and its waiting/dragging classes to the matching decorations. The public library does not emit Flux selectors or require its runtime. Clock geometry, pointer calculations and gauge illustration remain application examples.

### Application shells

`@include flair.application-shell($sidebar: "> aside", $content: "> section", $from: 60rem)` binds a responsive two-column shell to application selectors. Both selectors must identify direct children. Below the supplied breakpoint, children follow document order in one column. Above it, `--flair-sidebar-width` (18rem by default) sets the rail and the content fills the remainder. The rail is sticky and independently scrollable; `--flair-sticky-offset` defaults to 0px. `--flair-shell-height` defaults to 100svh and `--flair-layout-gap` to 0. This mixin applies no colours or components. It is also directly importable from `mixin/application-shell`.

`%l-page-frame` accepts `--flair-page-margin` (default `auto`) for its inline margins. Set it to `0` to anchor a capped frame to the inline start. See [the application layout proofs](playground.md#application-layout-proofs) for centred, capped-panel and fluid examples.

Navigation current-item backgrounds can be set independently of general selection with `--flair-nav-current-background` (falls back to `--flair-selected-background`). Side navigation accepts `--flair-side-nav-current-shadow`, falling back to the standard navigation current shadow. The GitHub preset disables navigation shadows. Page tabs use `--flair-tab-indicator-width` (default `0px`) and `--flair-tab-indicator-color` (default accent colour) for a separate, straight current-item border on the list item. GitHub sets this to 2px coral, leaving the rounded link independent of the indicator.

`--flair-nav-current-hover-background` controls the current navigation link on hover and keyboard focus, falling back to its ordinary current background. GitHub uses the same subtle grey hover background for current and other links.

Page tabs separate link spacing from the indicator container: `--flair-tab-link-margin` defaults to `0`, while `--flair-tab-link-padding-inline`, `--flair-tab-link-radius` and `--flair-tab-gap` fall back to their navigation equivalents. GitHub uses a 0.5rem inset, padding and radius with no gap between list items, so the straight indicator spans the container beneath the smaller hover target.

`--flair-tab-current-weight` overrides selected page-tab weight, falling back to `--flair-nav-current-weight` (700). GitHub sets both ordinary and selected header tabs to 500, while other selected navigation links remain bold.

### GitHub reference checks

The optional `test/github-reference-check.cjs` compiles the original reference SCSS read-only and compares it with Flair using identical, generic fixture text. Run it with `FLAIR_GITHUB_REFERENCE=/path/to/reference NODE_PATH=/tmp/flair-review/node_modules node test/github-reference-check.cjs`. It checks header and sidebar links, inputs, selects, textareas and ordinary/primary buttons at rest, on hover and on keyboard focus. It compares computed colours, opacity, typography, spacing, borders, transitions and dimensions, then checks that the header and sidebar screenshots are byte-identical. Screenshots are written to `/tmp/flair-github-parity/`. The check uses Chromium at 1200px, in light mode, with the shared Mona Sans font loaded; it does not establish parity for app-specific icons, dialogs, editors, dark mode or every viewport.

The source's inactive header links have 0.75 opacity, including their hover background, while selected links use full opacity. Its body/navigation use sans-serif and normal leading; Mona Sans belongs to native controls. These distinctions are represented by the GitHub preset rather than playground overrides. Tab opacity, weight, transition, wrapping, overflow and current background are independently configurable through `--flair-tab-*` properties. Side navigation has separate background, focus, leading, inset and optional pseudo-element icon-slot properties (`--flair-side-nav-*`). Other themes retain their defaults. `--flair-control-font` defaults to the body font; `--flair-control-transition` defaults to none.

Disclosure summaries accept `--flair-disclosure-weight` (falls back to heading weight) and `--flair-disclosure-hover-background` (falls back to navigation hover background). GitHub uses 700 weight and the unchanged summary background on hover. The native disclosure marker is retained.

### Contrasting sidebars

Applications request the visual variant in SCSS; they do not choose a background colour:

```scss
@use "flair";

.handbook {
    @include flair.application-shell($content: "> article");
    > aside { @extend %d-sidebar-contrast; }
    > aside > nav { @extend %p-side-navigation; }
}
```

`%d-sidebar-contrast` is a decoration: it adds no layout, dimensions, padding or HTML classes. It coordinates the sidebar surface, navigation text and resting/hover/focus/current states through inherited properties scoped to that sidebar. Resting links are transparent; hovered and focused links use a theme-defined contrasting fill; selected links retain a distinct background and foreground when hovered or focused. Ordinary sidebars elsewhere retain their theme's normal appearance.

Themes provide `--flair-sidebar-contrast-background`, `--flair-sidebar-contrast-text`, `--flair-sidebar-contrast-hover-background`, `--flair-sidebar-contrast-current-background` and `--flair-sidebar-contrast-current-text`. Defaults supply the monochrome version, and each preset supplies its own coordinated palette. A custom theme can set these five properties at its root. The GitHub variant uses a light grey sidebar, transparent resting links, a darker grey hover and a still darker current-item fill. The ordinary GitHub sidebar remains white.

The documentation and dashboard playground pages opt into this variant; their application SCSS no longer assigns sidebar background colours. The public module can also be imported directly as `decoration/sidebar-contrast`.

### Extending a sidebar surface to the viewport edge

`flair.sidebar-bleed($from: 60rem)` is an optional, responsive decoration for an existing sidebar. It paints the current sidebar surface towards the inline-start viewport edge (left in LTR, right in RTL), preserving the centred page frame, sidebar width and internal scrolling. Apply it alongside the surface variant:

```scss
.handbook > aside {
    @extend %d-sidebar-contrast;
    @include flair.sidebar-bleed($from: 60rem);
}
```

The mixin reads `--flair-sidebar-background`, supplied by `%d-sidebar-contrast`, and otherwise falls back to the theme's ordinary surface. There are no theme-specific colours in application SCSS. It uses an outward box shadow and a clip path to restrict painting to the sidebar's height and inline-start side, without creating horizontal scrollable overflow or an interactive overlay. It owns the sidebar's `box-shadow` and `clip-path`; ancestors must not clip the outward painting. Import it directly from `mixin/sidebar-bleed` or through `flair`.

## Theme identity and colour scheme

Choose a theme in SCSS once. Its colours then follow the system preference without JavaScript:

```scss
@use "flair";
@use "theme";

html {
    @include theme.base;
    @include theme.github;
    background: var(--flair-color-surface);
    color: var(--flair-color-text);
}
```

```html
<html lang="en">                    <!-- Follow the system -->
<html lang="en" data-theme="light"> <!-- Always light -->
<html lang="en" data-theme="dark">  <!-- Always dark -->
```

Removing `data-theme` restores the system preference, including live changes. Both modes share typography, dimensions, component structure and layout. The mixins set `color-scheme: light dark` and use CSS `light-dark()` pairs, so native controls and scrollbars follow the selected scheme too. The explicit attribute selects a single `color-scheme`. This requires a browser supporting CSS `light-dark()`.

For a custom theme, include `flair.defaults` and `flair.color-scheme` at `html`, then define paired semantic properties such as `--flair-color-surface: light-dark(#fff, #161616)` and `--flair-color-text: light-dark(#111, #f5f5f5)`. Set the component and contrast-sidebar palettes in that same theme. Colours that work in both modes can remain a single value. The standalone `defaults` mixin supplies colour pairs but leaves opting into system scheme selection to `color-scheme` or a theme mixin.

The demonstration website uses `data-flair-theme` for its preset picker; that attribute is not required by the library or by consuming applications. `data-theme` is reserved for the light/dark override. Demo preferences are stored independently in `flair-theme` and `flair-scheme` cookies, with `?theme=` and `?scheme=system|light|dark` GET fallbacks. The former Dark preset is now labelled Ink and, like every theme, has both schemes.

`test/color-scheme-browser-check.cjs` checks standalone consumers without JavaScript, both system preferences and explicit overrides, live switching and unchanged geometry. It also checks all demo routes in dark mode for overflow/accessibility and exercises persistence with and without JavaScript. Run it with the same optional browser-tool setup as the other browser checks.
