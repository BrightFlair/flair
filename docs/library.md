# Flair library reference

Flair is a set of Sass definitions for building a user interface, split so that
layout and theming are separate decisions. A layout can be built and reviewed in
black and white, and given a visual design afterwards, because no definition
names a colour, a font or a corner radius directly — only the role that a value
plays.

Importing `style/flair.scss` emits no CSS, no fonts and no JavaScript. An
application gets exactly the definitions it extends, and nothing else. The
example website alongside the library demonstrates every definition; each live
example shows its own HTML and Sass under **HTML and Sass**.

## Using the library

```scss
@use "flair";

:root {
	@include flair.defaults;
	--theme-font-body: "Ubuntu", sans-serif;
	--theme-grid-columns: 3;
}

.project-list {
	@extend %p-grid;
}

.project-summary {
	@extend %o-card;
}
```

Add Flair's `style` directory to the Sass load path. Fonts are loaded by the
application. Themes live in their own namespace: `@use "theme";` gives
`theme.base`, `theme.ink`, `theme.paper`, `theme.vivid`, `theme.github` and
`theme.material`. Include `theme.base` at the document root, then at most one
preset. Sass has a single module namespace, so the API is `theme.github`, not
`flair.theme.github`; `@use "theme/github" as theme;` imports one preset alone.

`@extend` emits the dependencies of the definition being extended, and Sass
cannot read HTML to prune descendant rules it does not find a use for. Keep
selectors narrow, and prefer setting an inherited property over restating a
component's CSS. Element typography and native control styling are opt-in
mixins — `flair.typography` and `flair.controls` — which can be included at the
root or scoped inside an application selector.

## Sass configuration

Almost everything in Flair is adjusted through inherited CSS custom properties.
A media query cannot read a custom property, and a URL cannot be assembled from
an attribute value, so the few values that must exist at compile time are Sass
variables. They all live in `style/variable/`, and are the only things a
consumer is expected to configure in Sass:

```scss
@use "flair" with (
	$break-compact: 46rem,
	$break-nav: 46rem,
	$break-shell: 46rem,
	$break-wide: 76rem,
	$icon-path: "/asset/icon/",
	$icon-extension: ".svg",
	$icon-names: (trash, share, copy, lock)
);
```

Configure them on the first `@use` of the library, before another module loads
it. Every definition reads these names rather than repeating a literal, so
moving a breakpoint moves it everywhere.

| Variable | Default | Effect |
| --- | --- | --- |
| `$break-compact` | `40rem` | Touch targets relax to their configured height, form actions become a wrapping row, compound fields become a row, and modal dialogs become centred panels instead of sheets. |
| `$break-nav` | `45rem` | Navigation and page-tab lists lay out horizontally instead of stacking. |
| `$break-shell` | `60rem` | Application shells and workspaces become two columns, and collapsible menus stop collapsing. |
| `$break-wide` | `70rem` | Sidebars become sticky alongside a long reading column. |
| `$icon-path` | `"/asset/icon/"` | Directory the masked icon files are served from. |
| `$icon-extension` | `".svg"` | File extension appended to an icon name. |
| `$icon-names` | `()` | The icon names an application uses. An unregistered name emits no rule. |

Mixins that take a `$from` argument default to the matching breakpoint, so a
single composition can still choose its own threshold without changing the
library: `flair.application-shell($from: 80rem)`.

## Layers

- **Variable** — overridable Sass configuration. No rules.
- **Mixin** — the palette, default properties, the document baseline, opt-in
  element rules, and the compositions that take arguments.
- **Decoration** — a treatment applied to something that already exists:
  typography, surface, focus, state, syntax colour, empty messages.
- **Object** — a single thing: a control, a button, a card, a badge, a dialog, a
  table, a link.
- **Pattern** — an arrangement of objects: forms, grids, stacks, navigation,
  lists, panels, trees.
- **Layout** — a whole composition: sidebar and content, workspace, gallery,
  dashboard, page frame.
- **Theme** — colours and tokens only. A theme never contains a selector, a
  layout decision, a font download or any JavaScript.

An application binds these to its own elements. The example website's `demo-*`
selectors are consumers of the library, not class names Flair requires.

## Colour

A theme is built in two layers. Nine numbered slots hold the raw colours, and
the named `--theme-*` properties map them onto meaning:

| Slot | Role |
| --- | --- |
| `--pal-1` | Foreground text |
| `--pal-2` | Base surface, behind the page |
| `--pal-3` | Raised surface: panels, controls, striped rows |
| `--pal-4` | Border |
| `--pal-5` | Muted foreground: captions, metadata, placeholders |
| `--pal-6` | Accent: links, focus, current state |
| `--pal-7` | Foreground on top of the accent |
| `--pal-8` | Positive |
| `--pal-9` | Negative |

`flair.palette` supplies a monochrome set, and `flair.defaults` maps it. A new
theme replaces the nine slots and inherits every mapping; where a colour does
not come from the palette, it sets the named property directly instead. A theme
needing more than nine adds further slots of its own and maps them the same way.

Every slot is a `light-dark()` pair, so one palette serves both schemes without
a second block of colours and without JavaScript.

```scss
@use "flair";

html {
	@include flair.defaults;
	@include flair.color-scheme;
	--pal-1: light-dark(#1f2328, #e6edf3);
	--pal-2: light-dark(#fff, #0d1117);
	--pal-6: light-dark(#0969da, #4493f8);
}
```

```html
<html lang="en">                    <!-- Follow the system -->
<html lang="en" data-theme="light"> <!-- Always light -->
<html lang="en" data-theme="dark">  <!-- Always dark -->
```

`flair.color-scheme` sets `color-scheme: light dark` and honours the
`data-theme` override, so native controls and scrollbars follow the selected
scheme too. Removing the attribute restores the system preference, including
live changes. This requires a browser supporting CSS `light-dark()`.

## Themes

| Theme | Character |
| --- | --- |
| Monochrome | Ubuntu, straight corners, unshadowed surfaces, neutral states. The default. |
| Ink | Neutral raised surfaces and a strong current-item treatment. |
| Paper | Serif headings, generous spacing and leading, warm insets, subtle shadows. |
| Vivid | Heavy borders, offset shadows, larger padding, lime selection, pill badges, dark code blocks. |
| GitHub | Sans-serif navigation with Mona Sans controls, compact panels, neutral current-navigation backgrounds, thin coral tab indicators, grey table stripes. |
| Material | Roboto, rounded elevated surfaces, tonal navigation, larger table padding, rounded badges. |

These are presentations of the same semantic markup, not reproductions of
another design system's widgets. Native controls keep their browser behaviour:
there are no floating labels, no ripple engine, no custom tab widget, no
replacement for `select`, and no theme-specific HTML.

## Responsive behaviour

Narrow is the base case. Width enhancements use `min-width` only, ordered from
smaller to larger, and are chosen where the content needs a different
arrangement rather than to match a named device. Media-query `rem` values follow
the browser's initial font size, not a theme's root override.

Prefer intrinsic sizing to a width query where a definition can manage without
one: available container space is more useful than screen size when the same
component appears in a sidebar, a panel or a nested layout. `%p-grid`, wrapping
rows and locally scrolling tables all adapt without a breakpoint. Queries for
accessibility preferences, such as reduced motion or forced colours, are
independent of this convention.

Objects and patterns never impose an application's content width. `%l-article`
deliberately limits reading measure with `--theme-prose-measure` (65ch);
`%p-prose` itself stays fluid.

Primary navigation stacks by default and becomes horizontal at `$break-nav`.
Side navigation stays vertical. Page tabs and pagination stay horizontal,
wrapping or scrolling locally. Navigation links have a minimum height of 44px
(or 2.75rem, whichever is larger) below `$break-nav`; controls, buttons,
labelled choices and disclosure summaries have the same minimum below
`$break-compact`. Form actions stack in source order, stretching to their
container, then form a wrapping row at `$break-compact`.

## Icons

A glyph is asked for in markup, by name:

```html
<button type="button" data-icon="trash"><span>Delete</span></button>
<a href="/docs" data-icon-end="link-external">Documentation</a>
```

```scss
@use "flair" with ($icon-names: (trash, link-external));

.toolbar { @include flair.icon; }
```

`flair.icon` binds `data-icon` and `data-icon-end` to `%p-icon` and turns each
registered name into a URL under `$icon-path`. Included without a selector the
rules apply document-wide; included inside one, only that subtree gets them.

The glyph is a mask filled with `currentColor`, so it takes the colour of the
text beside it and needs no separate rule in a dark scheme.
`--theme-icon-size`, `--theme-icon-gap`, `--theme-icon-opacity` and
`--theme-icon-scale` adjust a glyph without touching the file it comes from.

`%o-icon-button` is a square button whose meaning is carried by its glyph. Its
label stays in the document and is revealed on hover and on keyboard focus, so
the control is properly announced and never has an empty accessible name.

It stands exactly as tall as a button carrying words, in every theme, because
its glyph box holds a zero-width space and so contains a real line of text —
the same thing its neighbour is measuring. `--theme-icon-strut` and
`--theme-icon-ratio` are the properties that arrange this, and
`--theme-button-min-width` mirrors the button's height minimum so a theme with
a touch-target floor gets a square control.

Do not reach for `1lh` to match a line of text. Firefox resolves it against a
different metric from the one it renders `line-height: normal` with, so a
control sized that way comes out several pixels short of its neighbours there
while looking correct in Chromium. `test/engine-parity-check.cjs` measures
these relationships in both engines.

A definition that extends another cannot rely on an ordinary declaration to
override it. `@extend` emits each definition's rules at its own source
position, so `%o-button`'s declarations may well come after those of an object
extending it, and an application binding `flair.icon` adds `%p-icon`'s rules at
a higher specificity again. Express the difference as a property the extended
definition already reads, which resolves on the element whichever rule wins.

## Markup contracts

Flair reads structure and state from the document. Current state comes from
`aria-current`, never from a class, so the styling and the announcement cannot
disagree. Subjects and captions come from `data-*` attributes on the element
that owns them, so a message has no separate element to keep in step.

| Definition | Structure and behaviour |
| --- | --- |
| `%p-prose` | A text container with semantic headings, paragraphs, lists, quotations and links. Heading order belongs to the document. |
| `%o-card` | Any suitable container; direct headings, optional image and footer. Card width belongs to its parent. |
| `%p-panel` | A titled working surface. Each direct heading is separated from the content above it by a rule. A direct `article` takes the same rhythm without needing a heading. |
| `%o-avatar` | Image or initials. Give images appropriate alt text; hide initials where a visible name already conveys identity. |
| `%p-data-list` | `dl > div > dt + dd`; groups wrap into available columns. `--theme-data-min` (14rem) can be set to 100% for a single column. |
| `%p-list` | A `ul` or `ol` with direct `li` children; separators only between items. |
| `%p-key-value-list` | A `ul` or `dl` whose rows hold a name, a value, and optionally a trailing `form`. `data-term` names the subject for the empty case. Rows alternate shading. |
| `%p-navigation`, `%p-side-navigation`, `%p-page-tabs` | `nav > ul > li > a`, where `menu` is accepted in place of `ul`. Set `aria-current="page"` or `"location"` on the current destination only. Page tabs are links, not an ARIA tab widget. Side navigation draws a rule after any `li[data-end-of-section]`. |
| `%p-breadcrumbs` | `nav > ol > li`; explicit `.separator` spans use `aria-hidden="true"`. The current item can be plain text. |
| `%p-pagination` | Navigation structure; unavailable destinations are `span` elements, not actionable links. Give the nav an accessible label. |
| `%p-row-actions` | A row containing a `.row-actions` element. The actions fade in on hover and on focus within the row, and are never removed from the accessibility tree. |
| `%o-disclosure`, `%p-accordion` | `details > summary + .disclosure-content`; the accordion container has direct `details` children. Native markers and keyboard behaviour are retained. A shared `name` gives an exclusive group in supporting browsers. |
| `%o-dialog` | Native `dialog` with an accessible heading. Styling never forces a closed dialog to display. Inline content appears in normal flow before enhancement; `showModal()` supplies top-layer placement and focus containment. |
| `%o-drawer` | Native `dialog` pinned to an edge. `data-drawer-side="start"` moves it to the other one. Otherwise identical in responsibility to `%o-dialog`. |
| `%o-table`, `%p-table-scroll` | A semantic table inside a named, focusable scroll region. Use a caption and scoped headers. `.numeric` aligns numeric cells without changing their semantics. |
| `%o-notice` variants | A container with a visible status heading. A static notice is not a live alert; when to announce is the application's decision. |
| `%o-badge` | Noninteractive text label. Its shape alone must not imply an action. |
| `%o-progress` | Labelled native `progress` with `value` and `max`. Announcing a change belongs to a polite status region owned by the application. |
| `%o-code-block`, `%d-syntax` | `pre > code` or `samp`. Tokens carry `syntax-*` or the documented `hljs-*` classes. No parser is bundled. |
| `%p-syntax-tree` | Nested `details` elements, each holding a `summary` and a `.syntax-branch`. Closed nodes draw inline, open nodes indent. `data-language` names the format; `.syntax-index` carries `data-index`. Parsing and choosing which nodes start open are the application's work. |
| `%p-labelled-region` | A block of output with its caption in `data-label`. The element holds only the output, and can be replaced wholesale. |
| `%d-empty-message` | A container whose `:empty` state generates its own message, from `data-term` where present. |
| `%l-gallery` | Direct `figure` children containing images and captions. Intrinsic image dimensions avoid layout shift. |
| `%l-dashboard` | Optional header, `.metrics > article`, then other content. Data is supplied by the application. |
| `%l-workspace` | A direct `aside` rail followed by a `section` holding any number of panels. The rail comes first in source order. |
| `%l-sidebar` | A direct `aside` and `.layout-content`, wrapping in source order. Neither needs positioning or a matching offset. `--theme-sidebar-width` and `--theme-content-min` set preferred sizes. |
| `%p-form-fields`, `%p-field-row`, `%p-compound-field`, `%p-repeatable-fields` | The wrapping-label contract in [forms.md](forms.md). A compound field pairs controls that read as one value, and `data-span="narrow"` holds one to a fixed measure. Repeatable groups draw labels on the first row only, keeping them in the document for every row. |
| `%o-value`, `%p-metric`, `%p-output-row` | A metric holds a heading, an `output` or `.metric-value`, an optional `.metric-detail`, and `.actions`. `--theme-metric-align` (center/start/end) aligns both the value and the controls. Announcements and units belong to the consumer. |
| `%p-action-row`, `%p-action-list` | Lists contain `li`; rows contain `.row-content` and `.row-actions`, with optional leading content. Rows wrap in source order. |
| `%p-search-results` | Ordinary `ul > li > a` links, with an optional `.result-detail`. Filtering, announcements and requests are application behaviour. |
| `%p-page-intro`, `%d-typography-lead`, `%d-typography-eyebrow` | A direct `h1`/`h2` or `.intro-title`, followed by a lead paragraph. Heading levels remain the document's responsibility. |
| `%o-skip-link`, `%d-visually-hidden` | A skip link needs a real destination and is visible on focus. Hidden text must not contain invisible focusable controls. |
| `%p-empty-state` | A whole region with a heading and an action, for when there is nothing to show. `%d-empty-message` is the one-line form for a collection. |
| `%p-icon`, `%o-icon-button` | `data-icon` and `data-icon-end` name the glyph file. An icon button keeps its label in the document, revealed on hover and focus. |
| `%d-state-busy`, `%d-state-dragging`, `%d-state-reveal` | Applied only to the state being described. Reduced motion and print show revealed content immediately. |
| `%p-checklist` | A list whose items hold a `.checklist-marker` and text. Markers carry an explicit accessible label; `data-available="false"` on an item gives the secondary treatment. These are informational markers, not checkbox controls. |

A style cannot disable an anchor. Where there is no destination, use a native
disabled button or noninteractive text.

## Compositions

### Application shells

```scss
@use "flair";

.workspace {
	@include flair.application-shell($sidebar: "> aside", $content: "> section");
	> aside { @extend %d-sidebar-contrast; }
	> aside > nav { @extend %p-side-navigation; }
}
```

Both selectors must identify direct children. Below `$break-shell` the children
follow document order in one column; above it, `--theme-sidebar-width` (18rem)
sets the rail and the content fills the remainder. The rail is sticky and
scrolls independently. `--theme-sticky-offset` defaults to `0px`,
`--theme-shell-height` to `100svh` and `--theme-layout-gap` to `0`. The mixin
applies no colours and no components.

`%l-workspace` is the alternative where the content area holds several panels
rather than one region: the panels share the remaining space and wrap when
another will not fit. `--theme-workspace-panel` (24rem) is the width below which
a panel stops sharing a row, and `--theme-workspace-panel-max` caps one.

### Contrasting sidebars

An application asks for the visual variant; it does not choose a colour.
`%d-sidebar-contrast` adds no layout, dimensions, padding or class names. It
coordinates the sidebar surface, its navigation text, and the resting, hover,
focus and current states through inherited properties scoped to that sidebar.
Resting links are transparent, hovered and focused links take a contrasting
fill, and the selected link keeps a distinct background and foreground even
while hovered. Ordinary sidebars elsewhere keep the theme's normal appearance.

Themes supply `--theme-sidebar-contrast-background`, `-text`,
`-hover-background`, `-current-background` and `-current-text`. The defaults
give the monochrome version; each preset supplies its own coordinated set.

`flair.sidebar-bleed($from: $break-shell)` paints that surface towards the
inline-start viewport edge, preserving the centred page frame, the sidebar width
and its internal scrolling. It reads `--theme-sidebar-background`, supplied by
`%d-sidebar-contrast`, and otherwise falls back to the theme's ordinary surface,
so no theme-specific colour appears in application Sass. It uses an outward box
shadow with a clip path, so it creates no horizontal overflow and no interactive
overlay. It owns the sidebar's `box-shadow` and `clip-path`; ancestors must not
clip the outward painting.

### Collapsible menus

```html
<nav aria-label="Sections">
  <button type="button" aria-expanded="false" aria-controls="sections" hidden>Sections menu</button>
  <ul id="sections"><li><a href="/overview">Overview</a></li></ul>
</nav>
```

```scss
nav {
  @extend %p-side-navigation;
  @include flair.collapsible-navigation($from: 60rem);
}
```

The mixin expects a direct child button followed by a list. The application
removes `hidden` once it has installed a click handler, then toggles
`aria-expanded`. While the button is hidden the links remain available without
JavaScript. At the supplied breakpoint the button disappears and the links are
always visible, whatever the mobile expanded state. Keyboard focus must return
to the button when a menu containing focus is closed, and Escape should close
it.

### Page frames, headers and footers

`%l-page-frame` caps its width at 90rem by default; `--theme-page-gutter` and
`--theme-page-padding-block` default to space 6, and `--theme-page-margin`
(`auto`) can be set to `0` to anchor a capped frame to the inline start.
`%p-page-header` and `%p-page-footer` wrap their contents and use
`--theme-header-padding-block` (space 4).

`%p-page-footer-fixed` is extended alongside `%p-page-footer` to hold the footer
against the bottom of the viewport, for an application whose main region scrolls
on its own. The page must reserve the same height below its content. Printing
returns the footer to normal flow.

`flair.sticky-sidebar($from: $break-wide)` is optional and uses
`--theme-sticky-offset`; choose a threshold that suits the composition.

### Highlight decoration

`%d-highlight` draws a border with four square markers outside its corners. It
uses `::before`, which must stay available, and leaves layout to the consumer:
use `display: inline-block` for inline text so that wrapping produces one
enclosing box, and make sure ancestors allow overflow so the external markers
stay visible. `--theme-highlight-marker-size` defaults to `0.375rem`;
`--theme-highlight-border-width` and `-color` fall back to the standard border
properties. Markers use `currentColor` and intercept no pointer events.

### Interaction states

`%d-state-busy`, `%d-state-dragging` and `%d-state-reveal` are applied only to
the state they describe. Busy opacity defaults to `.55`, dragging opacity to
`.6`, and the drag outline to 2px. Reveal progress is 0–1 with a minimum opacity
of `.12`, a distance of 1.5rem and a duration of 650ms; reduced motion and print
both show revealed content immediately.

Flux maps `--flux-first-visible` to `--theme-reveal-progress` and its
waiting and dragging classes to the matching decorations. Flair emits no Flux
selectors and requires none of its runtime.

## Source inventory

Every file can be imported on its own, or reached through `flair.scss`.
Dependencies are explicit `@use` statements in the file that needs them.

Each file owns exactly one root name, matching its filename without the layer
prefix: `%d-stack` is in `decoration/stack.scss`. Nested variants stay with
their owner and are extended with the composed name, so `&-fixed` inside
`%p-page-footer` is extended as `%p-page-footer-fixed`. Unrelated definitions get
their own file. General mixins live in `mixin/<name>.scss`, theme mixins in
`theme/<name>.scss`, and each font file owns one family. Composition files
contain only imports and forwards.

| [`style/decoration/cluster.scss`](../style/decoration/cluster.scss) | `%d-cluster` |
| [`style/decoration/control.scss`](../style/decoration/control.scss) | `%d-control` |
| [`style/decoration/empty-message.scss`](../style/decoration/empty-message.scss) | `%d-empty-message` |
| [`style/decoration/focus-ring.scss`](../style/decoration/focus-ring.scss) | `%d-focus-ring` |
| [`style/decoration/highlight.scss`](../style/decoration/highlight.scss) | `%d-highlight` |
| [`style/decoration/sidebar-contrast.scss`](../style/decoration/sidebar-contrast.scss) | `%d-sidebar-contrast` |
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
| [`style/object/drawer.scss`](../style/object/drawer.scss) | `%o-drawer` |
| [`style/object/fieldset.scss`](../style/object/fieldset.scss) | `%o-fieldset` |
| [`style/object/form-field.scss`](../style/object/form-field.scss) | `%o-form-field` |
| [`style/object/icon-button.scss`](../style/object/icon-button.scss) | `%o-icon-button` |
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
| [`style/pattern/compound-field.scss`](../style/pattern/compound-field.scss) | `%p-compound-field` |
| [`style/pattern/data-list.scss`](../style/pattern/data-list.scss) | `%p-data-list` |
| [`style/pattern/empty-state.scss`](../style/pattern/empty-state.scss) | `%p-empty-state` |
| [`style/pattern/field-row.scss`](../style/pattern/field-row.scss) | `%p-field-row` |
| [`style/pattern/form-actions.scss`](../style/pattern/form-actions.scss) | `%p-form-actions` |
| [`style/pattern/form-fields.scss`](../style/pattern/form-fields.scss) | `%p-form-fields` |
| [`style/pattern/grid.scss`](../style/pattern/grid.scss) | `%p-grid` |
| [`style/pattern/icon.scss`](../style/pattern/icon.scss) | `%p-icon` (`&-end`) |
| [`style/pattern/key-value-list.scss`](../style/pattern/key-value-list.scss) | `%p-key-value-list` |
| [`style/pattern/labelled-region.scss`](../style/pattern/labelled-region.scss) | `%p-labelled-region` |
| [`style/pattern/list.scss`](../style/pattern/list.scss) | `%p-list` |
| [`style/pattern/metric.scss`](../style/pattern/metric.scss) | `%p-metric` |
| [`style/pattern/navigation.scss`](../style/pattern/navigation.scss) | `%p-navigation` |
| [`style/pattern/output-row.scss`](../style/pattern/output-row.scss) | `%p-output-row` |
| [`style/pattern/page-footer.scss`](../style/pattern/page-footer.scss) | `%p-page-footer` (`&-fixed`) |
| [`style/pattern/page-header.scss`](../style/pattern/page-header.scss) | `%p-page-header` |
| [`style/pattern/page-intro.scss`](../style/pattern/page-intro.scss) | `%p-page-intro` |
| [`style/pattern/page-tabs.scss`](../style/pattern/page-tabs.scss) | `%p-page-tabs` |
| [`style/pattern/pagination.scss`](../style/pattern/pagination.scss) | `%p-pagination` |
| [`style/pattern/panel.scss`](../style/pattern/panel.scss) | `%p-panel` |
| [`style/pattern/prose.scss`](../style/pattern/prose.scss) | `%p-prose` |
| [`style/pattern/repeatable-fields.scss`](../style/pattern/repeatable-fields.scss) | `%p-repeatable-fields` |
| [`style/pattern/row-actions.scss`](../style/pattern/row-actions.scss) | `%p-row-actions` |
| [`style/pattern/search-results.scss`](../style/pattern/search-results.scss) | `%p-search-results` |
| [`style/pattern/side-navigation.scss`](../style/pattern/side-navigation.scss) | `%p-side-navigation` |
| [`style/pattern/stack.scss`](../style/pattern/stack.scss) | `%p-stack` |
| [`style/pattern/syntax-tree.scss`](../style/pattern/syntax-tree.scss) | `%p-syntax-tree` |
| [`style/pattern/table-scroll.scss`](../style/pattern/table-scroll.scss) | `%p-table-scroll` |
| [`style/layout/article.scss`](../style/layout/article.scss) | `%l-article` |
| [`style/layout/dashboard.scss`](../style/layout/dashboard.scss) | `%l-dashboard` |
| [`style/layout/gallery.scss`](../style/layout/gallery.scss) | `%l-gallery` |
| [`style/layout/page-frame.scss`](../style/layout/page-frame.scss) | `%l-page-frame` |
| [`style/layout/sidebar.scss`](../style/layout/sidebar.scss) | `%l-sidebar` |
| [`style/layout/workspace.scss`](../style/layout/workspace.scss) | `%l-workspace` |
| [`style/mixin/application-shell.scss`](../style/mixin/application-shell.scss) | `@mixin application-shell` |
| [`style/mixin/base.scss`](../style/mixin/base.scss) | `@mixin base` |
| [`style/mixin/collapsible-navigation.scss`](../style/mixin/collapsible-navigation.scss) | `@mixin collapsible-navigation` |
| [`style/mixin/color-scheme.scss`](../style/mixin/color-scheme.scss) | `@mixin color-scheme` |
| [`style/mixin/controls.scss`](../style/mixin/controls.scss) | `@mixin controls` |
| [`style/mixin/defaults.scss`](../style/mixin/defaults.scss) | `@mixin defaults` |
| [`style/mixin/icon.scss`](../style/mixin/icon.scss) | `@mixin icon` |
| [`style/mixin/palette.scss`](../style/mixin/palette.scss) | `@mixin palette` |
| [`style/mixin/sidebar-bleed.scss`](../style/mixin/sidebar-bleed.scss) | `@mixin sidebar-bleed` |
| [`style/mixin/sticky-sidebar.scss`](../style/mixin/sticky-sidebar.scss) | `@mixin sticky-sidebar` |
| [`style/mixin/typography.scss`](../style/mixin/typography.scss) | `@mixin typography` |
| [`style/theme/base.scss`](../style/theme/base.scss) | `@mixin base` |
| [`style/theme/github.scss`](../style/theme/github.scss) | `@mixin github` |
| [`style/theme/ink.scss`](../style/theme/ink.scss) | `@mixin ink` |
| [`style/theme/material.scss`](../style/theme/material.scss) | `@mixin material` |
| [`style/theme/paper.scss`](../style/theme/paper.scss) | `@mixin paper` |
| [`style/theme/vivid.scss`](../style/theme/vivid.scss) | `@mixin vivid` |
| [`style/variable/break.scss`](../style/variable/break.scss) | `$compact`, `$nav`, `$shell`, `$wide` |
| [`style/variable/icon.scss`](../style/variable/icon.scss) | `$path`, `$extension`, `$names` |

## Property reference

`flair.defaults` sets the foundational values listed in [forms.md](forms.md).
The properties below are consumed with a fallback and are not reset on each
object, so setting one on an ancestor reaches everything beneath it. The
fallback column shows the next link in the chain, which eventually reaches a
foundational value or a literal.

| Property | Fallback |
| --- | --- |
| `--theme-accordion-gap` | `var(--theme-space-2)` |
| `--theme-actions-align` | `flex-end` |
| `--theme-actions-gap` | `var(--theme-space-3)` |
| `--theme-actions-margin` | `var(--theme-space-2)` |
| `--theme-avatar-radius` | `50%` |
| `--theme-avatar-size` | `3rem` |
| `--theme-badge-background` | `var(--theme-color-surface-disabled)` |
| `--theme-badge-border` | `var(--theme-color-border)` |
| `--theme-badge-padding-block` | `var(--theme-space-1)` |
| `--theme-badge-padding-inline` | `var(--theme-space-2)` |
| `--theme-badge-radius` | `var(--theme-radius)` |
| `--theme-badge-text` | `var(--theme-color-text)` |
| `--theme-border-width` | `1px` |
| `--theme-busy-opacity` | `0.55` |
| `--theme-button-background` | `var(--theme-color-surface)` |
| `--theme-button-background-active` | `var(--theme-button-background-hover, var(--theme-color-surface-disabled))` |
| `--theme-button-background-hover` | `var(--theme-color-surface-disabled)` |
| `--theme-button-border` | `var(--theme-control-border, var(--theme-color-border))` |
| `--theme-button-border-hover` | `var(--theme-control-border-hover, var(--theme-color-text))` |
| `--theme-button-font-size` | `var(--theme-font-size)` |
| `--theme-button-min-height` | `var(--theme-control-min-height)` |
| `--theme-button-min-width` | `auto` |
| `--theme-button-padding-block` | `var(--theme-control-padding-block, var(--theme-space-2))` |
| `--theme-button-padding-inline` | `var(--theme-control-padding-inline, var(--theme-space-3))` |
| `--theme-button-primary-background` | `var(--theme-color-accent)` |
| `--theme-button-primary-background-active` | `var(--theme-button-primary-background-hover, var(--theme-color-text))` |
| `--theme-button-primary-background-hover` | `var(--theme-color-text)` |
| `--theme-button-primary-border` | `var(--theme-button-primary-background, var(--theme-color-accent))` |
| `--theme-button-primary-decoration-hover` | `underline` |
| `--theme-button-primary-text` | `var(--theme-color-on-accent)` |
| `--theme-button-radius` | `var(--theme-control-radius, var(--theme-radius))` |
| `--theme-button-shadow-hover` | `none` |
| `--theme-button-text` | `var(--theme-color-text)` |
| `--theme-button-weight` | `var(--theme-label-weight)` |
| `--theme-card-title-size` | `1.25rem` |
| `--theme-checklist-gap` | `var(--theme-space-4)` |
| `--theme-checklist-marker-size` | `1.25rem` |
| `--theme-cluster-gap` | `var(--theme-space-3)` |
| `--theme-code-background` | `var(--theme-color-surface-disabled)` |
| `--theme-code-leading` | `1.6` |
| `--theme-code-padding` | `var(--theme-space-6)` |
| `--theme-code-radius` | `var(--theme-radius)` |
| `--theme-code-size` | `0.95em` |
| `--theme-code-tab-size` | `4` |
| `--theme-code-text` | `var(--theme-color-text)` |
| `--theme-color-control-width` | `4rem` |
| `--theme-color-success` | `var(--theme-color-text)` |
| `--theme-color-warning` | `var(--theme-color-text)` |
| `--theme-compound-gap` | `var(--theme-space-4)` |
| `--theme-compound-narrow` | `8rem` |
| `--theme-content-min` | `28rem` |
| `--theme-control-background` | `var(--theme-color-surface)` |
| `--theme-control-background-disabled` | `var(--theme-color-surface-disabled)` |
| `--theme-control-background-focus` | `var(--theme-control-background, var(--theme-color-surface))` |
| `--theme-control-border` | `var(--theme-color-border)` |
| `--theme-control-border-hover` | `var(--theme-color-text)` |
| `--theme-control-focus-offset` | `var(--theme-focus-offset)` |
| `--theme-control-font` | `var(--theme-font-body)` |
| `--theme-control-invalid-border-style` | `dashed` |
| `--theme-control-padding-block` | `var(--theme-space-2)` |
| `--theme-control-padding-inline` | `var(--theme-space-3)` |
| `--theme-control-radius` | `var(--theme-radius)` |
| `--theme-control-text` | `var(--theme-color-text)` |
| `--theme-control-text-disabled` | `var(--theme-color-muted)` |
| `--theme-control-transition` | `none` |
| `--theme-danger-background-hover` | `var(--theme-color-danger)` |
| `--theme-danger-text-hover` | `var(--theme-color-surface)` |
| `--theme-data-min` | `14rem` |
| `--theme-dialog-backdrop` | `rgb(0 0 0 / 55%)` |
| `--theme-dialog-width` | `32rem` |
| `--theme-disabled-opacity` | `1` |
| `--theme-disclosure-background` | `transparent` |
| `--theme-disclosure-hover-background` | `var(--theme-nav-hover-background, var(--theme-color-surface-disabled))` |
| `--theme-disclosure-padding` | `var(--theme-space-4)` |
| `--theme-disclosure-weight` | `var(--theme-heading-weight, 500)` |
| `--theme-drag-opacity` | `0.6` |
| `--theme-drag-outline-width` | `2px` |
| `--theme-drawer-backdrop` | `rgb(0 0 0 / 35%)` |
| `--theme-drawer-backdrop-blur` | `0.5rem` |
| `--theme-drawer-sheet-height` | `12rem` |
| `--theme-drawer-width` | `22rem` |
| `--theme-empty-message` | `"There is nothing here yet."` |
| `--theme-empty-message-align` | `center` |
| `--theme-empty-message-padding` | `var(--theme-space-8)` |
| `--theme-empty-message-prefix` | `"There are no "` |
| `--theme-empty-message-style` | `italic` |
| `--theme-empty-message-suffix` | `" added yet."` |
| `--theme-empty-padding` | `var(--theme-space-8)` |
| `--theme-eyebrow-size` | `0.75rem` |
| `--theme-eyebrow-tracking` | `0.12em` |
| `--theme-eyebrow-weight` | `700` |
| `--theme-field-gap` | `var(--theme-space-2)` |
| `--theme-fieldset-padding` | `var(--theme-space-4)` |
| `--theme-focus-color` | `var(--theme-color-accent)` |
| `--theme-font-heading` | `var(--theme-font-body)` |
| `--theme-font-mono` | `"Ubuntu Mono", monospace` / `monospace` |
| `--theme-form-gap` | `var(--theme-space-4)` |
| `--theme-gallery-ratio` | `4 / 3` |
| `--theme-grid-columns` | `3` |
| `--theme-grid-gap` | `var(--theme-space-6)` |
| `--theme-grid-min` | `16rem` |
| `--theme-header-gap` | `var(--theme-space-6)` |
| `--theme-header-padding-block` | `var(--theme-space-4)` |
| `--theme-heading-1` | `2.5rem` |
| `--theme-heading-2` | `2rem` |
| `--theme-heading-3` | `1.5rem` |
| `--theme-heading-4` | `1.25rem` |
| `--theme-heading-leading` | `1.15` |
| `--theme-heading-tracking` | `normal` |
| `--theme-heading-weight` | `400` / `500` |
| `--theme-highlight-border-color` | `var(--theme-color-border)` |
| `--theme-highlight-border-width` | `var(--theme-border-width, 1px)` |
| `--theme-highlight-marker-size` | `0.375rem` |
| `--theme-icon` | `linear-gradient(#0000, #0000)` |
| `--theme-icon-button-layer` | `2` |
| `--theme-icon-end` | `linear-gradient(#0000, #0000)` |
| `--theme-icon-gap` | `var(--theme-space-2)` |
| `--theme-icon-opacity` | `1` |
| `--theme-icon-ratio` | `1` |
| `--theme-icon-scale` | `100%` |
| `--theme-icon-size` | `1.25rem` |
| `--theme-icon-strut` | `""` |
| `--theme-inset-background` | `var(--theme-color-surface-disabled)` |
| `--theme-intro-space` | `var(--theme-space-8)` |
| `--theme-intro-title-size` | `clamp(2.5rem, 5vw, 4.75rem)` |
| `--theme-key-value-border-width` | `var(--theme-border-width)` |
| `--theme-key-value-font` | `var(--theme-font-mono, monospace)` |
| `--theme-key-value-gap` | `var(--theme-space-4)` |
| `--theme-key-value-name` | `auto` |
| `--theme-key-value-padding` | `var(--theme-space-4)` |
| `--theme-key-value-radius` | `var(--theme-radius)` |
| `--theme-key-value-stripe-background` | `var(--theme-table-stripe-background, var(--theme-color-surface-disabled))` |
| `--theme-key-value-value-text` | `inherit` |
| `--theme-key-value-white-space` | `normal` |
| `--theme-key-value-wrap` | `wrap` |
| `--theme-label-font-size` | `var(--theme-font-size)` |
| `--theme-layout-gap` | `0` / `var(--theme-space-6)` |
| `--theme-lead-measure` | `55ch` |
| `--theme-lead-size` | `1.25rem` |
| `--theme-link-hover-thickness` | `var(--theme-link-thickness, 1px)` |
| `--theme-link-offset` | `0.2em` |
| `--theme-link-thickness` | `1px` |
| `--theme-list-padding` | `var(--theme-space-4)` |
| `--theme-message-font-size` | `var(--theme-font-size)` |
| `--theme-metric-align` | `center` |
| `--theme-metric-gap` | `var(--theme-space-4)` |
| `--theme-nav-current-background` | `var(--theme-selected-background, var(--theme-color-surface-disabled))` |
| `--theme-nav-current-hover-background` | `var(--theme-nav-current-background, var(--theme-selected-background, var(--theme-color-surface-disabled)))` |
| `--theme-nav-current-shadow` | `inset 0 -3px var(--theme-color-accent)` |
| `--theme-nav-current-text` | `var(--theme-selected-text, var(--theme-color-text))` |
| `--theme-nav-current-weight` | `700` |
| `--theme-nav-gap` | `var(--theme-space-2)` |
| `--theme-nav-hover-background` | `var(--theme-color-surface-disabled)` |
| `--theme-nav-padding-block` | `var(--theme-space-3)` |
| `--theme-nav-padding-inline` | `var(--theme-space-4)` |
| `--theme-nav-radius` | `var(--theme-radius)` |
| `--theme-nav-text` | `var(--theme-color-text)` |
| `--theme-notice-background` | `var(--theme-surface-background, var(--theme-color-surface))` |
| `--theme-notice-border-width` | `4px` |
| `--theme-notice-color` | `var(--theme-color-accent)` |
| `--theme-output-label-size` | `1.5rem` |
| `--theme-page-footer-background` | `var(--theme-color-surface-disabled)` |
| `--theme-page-footer-gap` | `var(--theme-space-8)` |
| `--theme-page-footer-layer` | `10` |
| `--theme-page-gutter` | `var(--theme-space-6)` |
| `--theme-page-margin` | `auto` |
| `--theme-page-padding-block` | `var(--theme-space-6)` |
| `--theme-page-width` | `90rem` |
| `--theme-panel-heading-space` | `var(--theme-space-4)` |
| `--theme-panel-heading-weight` | `var(--theme-heading-weight, 400)` |
| `--theme-panel-section-space` | `var(--theme-space-8)` |
| `--theme-panel-subheading-size` | `1.25rem` |
| `--theme-progress-height` | `0.75rem` |
| `--theme-prose-measure` | `65ch` |
| `--theme-quote-border-width` | `4px` |
| `--theme-region-background` | `var(--theme-color-surface-disabled)` |
| `--theme-region-font` | `inherit` |
| `--theme-region-label-space` | `var(--theme-space-8)` |
| `--theme-region-padding` | `var(--theme-space-2)` |
| `--theme-region-radius` | `var(--theme-radius)` |
| `--theme-repeat-actions-gap` | `var(--theme-space-2)` |
| `--theme-repeat-gap` | `var(--theme-space-4)` |
| `--theme-repeat-row-space` | `var(--theme-space-2)` |
| `--theme-result-link-padding` | `var(--theme-space-2)` |
| `--theme-results-max-height` | `none` |
| `--theme-reveal-distance` | `1.5rem` |
| `--theme-reveal-duration` | `650ms` |
| `--theme-reveal-min-opacity` | `0.12` |
| `--theme-reveal-progress` | `1` |
| `--theme-row-actions-duration` | `0.1s` |
| `--theme-row-actions-gap` | `var(--theme-space-2)` |
| `--theme-row-actions-opacity` | `0` |
| `--theme-row-background` | `var(--theme-color-surface)` |
| `--theme-row-content-min` | `8rem` |
| `--theme-row-gap` | `var(--theme-space-3)` |
| `--theme-selected-background` | `var(--theme-color-surface-disabled)` |
| `--theme-selected-text` | `var(--theme-color-text)` |
| `--theme-shell-height` | `100svh` |
| `--theme-side-nav-background` | `transparent` |
| `--theme-side-nav-current-focus-background` | `var(--theme-nav-current-hover-background, var(--theme-nav-current-background, var(--theme-selected-background, var(--theme-color-surface-disabled))))` |
| `--theme-side-nav-current-hover-background` | `var(--theme-side-nav-hover-background, var(--theme-nav-current-hover-background, var(--theme-nav-current-background, var(--theme-selected-background, var(--theme-color-surface-disabled)))))` |
| `--theme-side-nav-current-shadow` | `var(--theme-nav-current-shadow, inset 0 -3px var(--theme-color-accent))` |
| `--theme-side-nav-focus-background` | `var(--theme-nav-hover-background, var(--theme-color-surface-disabled))` |
| `--theme-side-nav-hover-background` | `var(--theme-nav-current-hover-background, var(--theme-nav-current-background, var(--theme-selected-background, var(--theme-color-surface-disabled))))` / `var(--theme-nav-hover-background, var(--theme-color-surface-disabled))` |
| `--theme-side-nav-icon-content` | `none` |
| `--theme-side-nav-icon-gap` | `0` |
| `--theme-side-nav-icon-opacity` | `1` |
| `--theme-side-nav-icon-size` | `0` |
| `--theme-side-nav-line-height` | `inherit` |
| `--theme-side-nav-link-margin` | `0` |
| `--theme-side-nav-margin-block-start` | `0` |
| `--theme-side-nav-marker-color` | `var(--theme-color-accent)` |
| `--theme-side-nav-marker-height` | `1.5rem` |
| `--theme-side-nav-marker-offset` | `0` |
| `--theme-side-nav-marker-radius` | `999px` |
| `--theme-side-nav-marker-width` | `0` |
| `--theme-side-nav-separator-space` | `var(--theme-space-2)` |
| `--theme-side-nav-separator-width` | `calc(100% - 2rem)` |
| `--theme-sidebar-background` | `var(--theme-color-surface)` |
| `--theme-sidebar-width` | `16rem` / `18rem` |
| `--theme-skip-link-layer` | `100` |
| `--theme-small-size` | `0.875rem` |
| `--theme-stack-gap` | `var(--theme-space-4)` |
| `--theme-sticky-offset` | `0px` / `var(--theme-space-6)` |
| `--theme-surface-background` | `var(--theme-color-surface)` |
| `--theme-surface-border-width` | `var(--theme-border-width)` |
| `--theme-surface-padding` | `var(--theme-space-6)` |
| `--theme-surface-radius` | `var(--theme-radius)` |
| `--theme-surface-shadow` | `none` |
| `--theme-syntax-attribute` | `var(--theme-color-accent)` |
| `--theme-syntax-comment` | `var(--theme-color-muted)` |
| `--theme-syntax-key` | `var(--theme-color-text)` |
| `--theme-syntax-keyword` | `var(--theme-color-accent)` |
| `--theme-syntax-number` | `var(--theme-color-accent)` |
| `--theme-syntax-punctuation` | `var(--theme-color-muted)` |
| `--theme-syntax-string` | `var(--theme-color-text)` |
| `--theme-syntax-tag` | `var(--theme-syntax-keyword, var(--theme-color-accent))` |
| `--theme-syntax-tree-guide-color` | `var(--theme-color-border)` |
| `--theme-syntax-tree-guide-space` | `0` |
| `--theme-syntax-tree-guide-width` | `0px` |
| `--theme-syntax-tree-hover-background` | `var(--theme-color-surface-disabled)` |
| `--theme-syntax-tree-indent` | `var(--theme-space-4)` |
| `--theme-syntax-tree-leading` | `1.6` |
| `--theme-syntax-type` | `var(--theme-syntax-number, var(--theme-color-accent))` |
| `--theme-syntax-value` | `var(--theme-syntax-string, var(--theme-color-text))` |
| `--theme-tab-border-width` | `var(--theme-border-width)` |
| `--theme-tab-current-background` | `var(--theme-nav-current-background, var(--theme-selected-background, var(--theme-color-surface-disabled)))` |
| `--theme-tab-current-opacity` | `1` |
| `--theme-tab-current-weight` | `var(--theme-nav-current-weight, 700)` |
| `--theme-tab-gap` | `var(--theme-nav-gap, var(--theme-space-2))` |
| `--theme-tab-indicator-color` | `var(--theme-color-accent)` |
| `--theme-tab-indicator-width` | `0px` |
| `--theme-tab-link-margin` | `0` |
| `--theme-tab-link-opacity` | `1` |
| `--theme-tab-link-padding-inline` | `var(--theme-nav-padding-inline, var(--theme-space-4))` |
| `--theme-tab-link-radius` | `var(--theme-nav-radius, var(--theme-radius))` |
| `--theme-tab-link-transition` | `none` |
| `--theme-tab-link-weight` | `inherit` |
| `--theme-tab-overflow` | `visible` |
| `--theme-tab-scrollbar` | `auto` |
| `--theme-tab-wrap` | `wrap` |
| `--theme-table-header-background` | `var(--theme-color-surface-disabled)` |
| `--theme-table-hover-background` | `var(--theme-color-surface-disabled)` |
| `--theme-table-padding-block` | `var(--theme-space-3)` |
| `--theme-table-padding-inline` | `var(--theme-space-4)` |
| `--theme-table-stripe-background` | `transparent` / `var(--theme-color-surface-disabled)` |
| `--theme-text-leading` | `1.6` |
| `--theme-value-leading` | `1.2` |
| `--theme-value-size` | `3rem` |
| `--theme-value-unit-size` | `0.5em` |
| `--theme-value-weight` | `700` |
| `--theme-workspace-gap` | `var(--theme-space-4)` |
| `--theme-workspace-padding` | `var(--theme-space-4)` |
| `--theme-workspace-panel` | `24rem` |
| `--theme-workspace-panel-max` | `none` |

## Consuming Flair from an application

Add Flair as a dependency and put its `style` directory on the Sass load path:

```json
{ "dependencies": { "flair": "github:BrightFlair/flair" } }
```

A local checkout works the same way with `"flair": "file:../../BrightFlair/flair"`,
adjusting the relative path. WebEngine projects override the Sass command in
`build.ini`:

```ini
[style/**/*.scss]
execute=./node_modules/.bin/sass --load-path=node_modules/flair/style ./style/style.scss www/style.css --source-map --embed-sources --embed-source-map
```

The package contains the public Sass entry and the library directories:
`variable`, `mixin`, `theme`, `decoration`, `object`, `pattern` and `layout`.
Application fonts, scripts and website-specific properties are not included.
`test/package.test.cjs` compiles a full application stylesheet from that file
list alone, so a definition cannot come to depend on anything unpublished.

## Verification

`npm test` runs the Sass API and structure checks, and `gt build` compiles the
example website. The checks cover: the entry point emitting nothing on import;
every placeholder compiling in isolation; one owner per file with a matching
name; no desktop-first width queries; every variable-layer value being
overridable; themes exporting no selectors, fonts or URLs; each mixin working
both directly and through `flair`; every definition having a live example with
its source; and the published package compiling on its own.

The browser review covers every section in every theme at 320px, 768px and
1440px, plus native disclosure and dialog behaviour, progress updates, clipboard
success and failure, theme persistence and the no-JavaScript fallback.
Automated accessibility checks supplement keyboard and visual review rather than
replacing it.

Worth checking by hand: open the source listings, tab through every control,
resize a nested grid, scroll a narrow table with the keyboard, open a dialog and
dismiss it with Escape, switch themes while a dialog is open, and compare narrow
layouts at enlarged text sizes. Test native controls in the browsers the
application supports.

### Running the optional browser checks

Browser tooling stays outside the library's dependencies:

```sh
npm install --prefix /tmp/flair-review playwright @axe-core/playwright
NODE_PATH=/tmp/flair-review/node_modules node test/browser-check.cjs
```

Start the website on port 8084 first with `gt run -p 8084`. `FLAIR_TEST_URL`
selects another address and `FLAIR_CHROMIUM_PATH` another Chromium executable;
the default is `/usr/bin/chromium`. The script checks every page, theme and
width combination, runs axe on each page and theme at desktop width, and
exercises the example interactions. Clipboard tests simulate both success and
permission failure, and never read the real clipboard.

`test/color-scheme-browser-check.cjs` checks consumers with no JavaScript, both
system preferences, explicit overrides, live switching and unchanged geometry.
`test/mobile-browser-check.cjs` covers touch navigation, keyboard dismissal,
breakpoint transitions, full-screen modal forms, every theme and scheme
combination, and the no-JavaScript fallback.

`test/engine-parity-check.cjs` measures control geometry in Chromium and
Firefox across every theme, asserting relationships between elements rather
than pixel counts, because font metrics legitimately differ between engines.

```sh
NODE_PATH=/tmp/flair-review/node_modules node test/engine-parity-check.cjs
```

`test/github-reference-check.cjs` compiles a reference stylesheet read-only and
compares it with Flair using identical fixture text: header and sidebar links,
inputs, selects, textareas and both button kinds, at rest, on hover and on
keyboard focus. It compares computed colours, opacity, typography, spacing,
borders, transitions and dimensions, then checks that the header and sidebar
screenshots are byte-identical.

```sh
FLAIR_GITHUB_REFERENCE=/path/to/reference NODE_PATH=/tmp/flair-review/node_modules \
	node test/github-reference-check.cjs
```

It runs Chromium at 1200px in light mode with Mona Sans loaded. It does not
establish parity for application icons, dialogs, editors, dark mode or every
viewport.

Behaviour references: [native details](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details),
[native dialogs](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog),
[CSS grid](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids).

## The example website

The website is a consumer of the library, not part of it. `--site-*` properties,
the section switcher, cookies and the demo scripts belong to it. Its preset
picker uses `data-flair-theme`, which the library does not require;
`data-theme` is reserved for the light and dark override. Preferences are stored
in `flair-theme` and `flair-scheme` cookies, with `?theme=` and
`?scheme=system|light|dark` as fallbacks.

Library content is capped at 80rem with gutters outside that measure. At the
GitHub theme's 14px root that is 1120px, and at a 16px root, 1280px. Demo narrow
containers and compact variants are local examples, not library defaults.

The documentation switcher stays in normal flow on mobile so it cannot obscure
focused content, and is fixed from 60rem. The dialog and drawer examples reveal
their actions after enhancement, reset `returnValue` before reopening, and
report each choice in a status region outside the dialog, returning focus to the
opener. Those behaviours belong to `script/component/library-example.es6`.
