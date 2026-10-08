# Flair ownership and composition

Flair's public entry point is definitions only. Importing it emits no CSS,
fonts, network requests or application selectors. Every placeholder has one
file, explicit dependencies, and a reason independent of an application.
Native defaults are separate opt-in mixins.

| Layer | Owns | Does not own |
| --- | --- | --- |
| Variable | Configurable Sass values and CSS value mixins: palette, scale, roles | Rules for controls or page structure |
| Decoration | Appearance: colour, typography, border, shadow, focus and visual state | Padding, child arrangement or dimensions of a UI unit |
| Element | Opt-in native defaults and normalisation | Application classes or route composition |
| Object | One UI role, including its dimensions, internal content and interaction states | Page placement or application data |
| Pattern | Relationships between units and their shared state | Whole-page regions or route exceptions |
| Layout | Arrangement of major regions and collections | Surface colours, fonts, borders or tile contents |
| Component | An application's named HTML component and its presentation | Business rules or generic library definitions |
| Page | Route composition and route-specific measurements | Copies of shared controls and themes |

Visually hidden text is a deliberate Decoration exception: clipping is its
reusable accessibility treatment. The highlight decoration positions only its
own paint markers. Syntax decorations colour descendant tokens; they never
arrange source structure. Objects may compose a pattern for their internal
relationships; Element may consume Object. These are responsibility boundaries,
not a numeric Sass import order.

## Foundation

`variable/palette` contains nine grayscale light/dark pairs.
`variable/tokens` supplies a complete semantic foundation, system fonts and a
spacing unit multiplied from 1 through 12. `flair.defaults` exposes those
values without document selectors. `theme.base` adds native colour-scheme
selection. All presets include `theme.base`, then override values only. Fonts
are downloaded by applications, never by the library.

Themes contain no component selectors, layout rules or application properties.
A project must stay usable when its preset is replaced with base. Colour is
supplemented by labels, borders, native checked state, aria-current or
aria-pressed. There is no styling-only promise that aria-disabled prevents an
action; native disabled controls or application behavior provide that.

## Responsibility corrections

| Old API | New API | Reason |
| --- | --- | --- |
| `%d-stack`, `%d-cluster` | `%p-stack`, `%p-cluster` | Relationships and spacing between children |
| `%p-grid` | `%l-grid` | Spatial arrangement of a collection |
| `%p-panel` | `%o-panel` | One recognisable working surface |
| `%d-empty-message` | `%p-empty-message` | A collection's empty state, including generated content |
| Surface padding in `%d-surface` | Each surface object owns padding | Appearance does not impose dimensions |
| Control padding in `%d-control` | `%o-interactive` | Geometry of an interactive unit |
| Cards inside dashboard/gallery layouts | Consumer composes `%o-card` | Layout does not choose tile appearance |

No aliases preserve the mistaken ownership. Examples and all reference projects
use the corrected names.

## Additions demonstrated by Provider

| Definition | Reason |
| --- | --- |
| `%o-interactive` | Shared dimensions of text controls and button roles |
| `%o-labelled-control` | A caption and a native control or application select wrapper; does not assume the full `.field` structure |
| `%o-toggle-badge` | A native checkbox with a badge caption and visible checked/focus states |
| `%o-content-panel`, `%o-content-panel-borderless` | A surface with form/footer section rhythm, with an optional borderless variant |
| `%o-settings-panel`, `%o-settings-disclosure` | One settings surface, either always visible or natively disclosed |
| `%o-disclosure-menu` | A native disclosure that places one transient action surface beside its trigger |
| `%o-record-data-table` | A compact table with prioritised columns; disclosures provide the remaining data |
| `%p-record-table` | Compact labelled cells that can become ordinary columns without hiding data |
| `%p-summary-table` | Fixed two-column summaries, with a narrow right-aligned value column |
| `%p-record-list` | Repeated identities with actions and optional details |
| `%p-identity` | Avatar beside a readable name and secondary caption |
| `%p-toolbar` | Wrapping actions with an optional end-aligned group |
| `%p-segmented-control` | Buttons share edges, selected state and stacking during focus/press |
| `%p-field-action` | A field beside its action, aligned at the control edge |
| `%p-rail-navigation` | Compact vertical links or native buttons; document navigation separately supports gutters and markers |
| `%l-centered-panel` | Main content and footer occupy a viewport-height frame, with a bounded panel at wider widths |
| `%l-admin-shell` | A fixed desktop rail with independently flowing content and footer; distinct from wrapping `%l-sidebar` and sticky `application-shell` |
| `%l-split` | Main and secondary regions wrap according to available space |
| `%l-metric-grid` | Bounded metric tiles share a collection and report their container size |
| `%d-focus` | An outline with hover-independent focus/press transitions, distinct from the focus-visible paint-only ring |

## Container queries and Sass

Sass emits empty `@container` rules from unused placeholders. To preserve the
no-output import contract, responsive column enhancements are opt-in mixins:

```scss
@use "flair";
.table-region { container-type: inline-size; }
.records {
  @extend %o-record-data-table;
  @extend %p-record-table;
  @include flair.record-table-columns;
}
```

`record-data-table-columns` switches priority cells and their alternative
disclosure at the compact breakpoint. `record-table-columns` switches labelled
cells into ordinary table columns. Both use the enclosing container's width.
Application scripts, sorting, submission and disclosure dismissal remain outside
these styles.

The structural tests enforce naming, isolated importability, neutral base values,
layout/decoration boundaries and theme inheritance. Browser checks exercise all
current examples, schemes, narrow widths, keyboard interactions and accessibility.
