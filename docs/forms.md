# Form foundations

Controls, field objects and the patterns that arrange them. Validation, submission and data binding belong to the application; Flair supplies only the presentation and the native behaviour that comes with it.

Review the live examples at `/library/controls/` and `/library/forms/`. The global theme selector and local spacing selectors belong to the website, not the library runtime. The theme selection applies to every page and is stored in a cookie. The server renders the selected theme before styles load; JavaScript applies changes immediately. Without JavaScript, the Apply button submits the theme form.

## Entry points

```scss
@use "path/to/flair/style/flair";

:root {
	@include flair.defaults;
}

contact-form form {
	@extend %p-form-fields;
}
```

`style/flair.scss` emits no CSS by itself and imports no fonts. `defaults()` emits properties in the selector where it is included. Include it on the application root, or on the root of an independent theme preview. Load the fonts in your application, or override `--theme-font-body`.

Individual modules can be loaded instead of the aggregate entry point:

```scss
@use "path/to/flair/style/mixin/defaults";
@use "path/to/flair/style/object/button";

:root {
	@include defaults.defaults;
}
.download {
	@extend %o-button;
}
```

Optional element defaults:

```scss
@use "path/to/flair/style/flair";
@include flair.controls; // Global native-tag rules.

// Alternatively, scope the same rules to a particular region:
.editor {
	@include flair.controls;
}
```

`controls($prefix: "")` maps native tags to their objects. The optional selector prefix is used internally as `"> "` for direct child controls. No element defaults are emitted by importing the module alone. Hidden and image inputs are excluded. Other inputs, selects and textareas receive `%o-control`, except checkbox/radio, range, colour, and button/submit/reset inputs, which have dedicated mappings. Unsupported or absent input types retain the browser's text-input behaviour. Native file pickers, date pickers, select menus and sliders remain browser-dependent.

## Definitions

| Layer and source | Public definition | Responsibility and dependency |
| --- | --- | --- |
| `style/mixin/defaults.scss` | `defaults()` | Monochrome values and shared scales; explicitly emitted by the consumer. |
| `style/decoration/focus-ring.scss` | `%d-focus-ring` | Outline width, colour and offset. |
| `style/decoration/control.scss` | `%d-control` | Shared font, padding, border, background, hover, disabled and explicit invalid presentation. Its `:focus-visible` rule extends `%d-focus-ring`. |
| `style/object/control.scss` | `%o-control` | Extends `%d-control`; full-width text-like controls, placeholder colour, read-only border and resizable textarea. |
| `style/object/choice.scss` | `%o-choice` | Native checkbox/radio size and accent; extends focus ring on keyboard focus. |
| `style/object/range.scss` | `%o-range` | Native full-width range input; extends focus ring on keyboard focus. |
| `style/object/color.scss` | `%o-color` | Extends `%d-control`; smaller colour picker. |
| `style/object/button.scss` | `%o-button` | Extends `%d-control`; inline button or link presentation, alignment and colours. |
| `style/object/button-primary.scss` | `%o-button-primary` | Extends `%o-button`; accent background with contrasting text. |
| `style/mixin/controls.scss` | `controls()` | Optional native-tag mappings to the objects above. |
| `style/object/form-field.scss` | `%o-form-field` | Label/control/message stack; includes direct-child element mappings. |
| `style/object/choice-field.scss` | `%o-choice-field` | Checkbox/radio with wrapping text; extends `%o-choice` on the input. |
| `style/object/fieldset.scss` | `%o-fieldset` | Native legend and bordered group; extends field and choice objects on its children. |
| `style/pattern/field-row.scss` | `%p-field-row` | Wrapping flex row; extends field objects on direct `.field` or `label` children. |
| `style/pattern/form-actions.scss` | `%p-form-actions` | Wrapping actions; extends button objects and primary variant. Preserves DOM order. |
| `style/pattern/form-fields.scss` | `%p-form-fields` | Field stack that composes field, choice, fieldset, row and action definitions. |

Element mapping mixins may depend on objects, and the form-field object may use the controls mixin. This graph is acyclic: the controls mixin imports control and button objects, not the form-field object. Directory order is not dependency order.

Only placeholders are extended. Pattern classes such as `.field` are structural hooks, not global style classes. No reusable selectors are emitted for the gallery's custom tags or page names.

## Markup contract

```html
<form class="profile" method="post">
	<div class="field-row">
		<label>
			<span>Name (required)</span>
			<input name="name" required autocomplete="name" />
		</label>
		<label>
			<span>Email (required)</span>
			<input type="email" name="email" required autocomplete="email" />
		</label>
	</div>
	<label>
		<span>Notes</span>
		<textarea name="notes" aria-describedby="notes-help"></textarea>
		<span id="notes-help" class="field-help">Optional information.</span>
	</label>
	<fieldset>
		<legend>Notifications</legend>
		<label class="choice">
			<input type="checkbox" name="updates" />
			<span>Receive updates</span>
		</label>
	</fieldset>
	<div class="actions">
		<button class="action-start" type="reset">Reset</button>
		<button class="primary" type="submit">Save</button>
	</div>
</form>
```

```scss
.profile {
	@extend %p-form-fields;
}
```

- Use direct wrapping `label` children for fields: caption in the first `span`, followed by the control and optional `.field-help`/`.field-error` spans. The control needs no ID unless something else references it. Help/error spans retain IDs for `aria-describedby`. A `.field` container with a separate associated label is supported when grouping requires it.
- Direct `.field-row` children contain `.field` or wrapping `label` children. They wrap based on container width, not viewport width.
- Direct `.choice` children are wrapping labels with a checkbox/radio and text in a span.
- Direct `fieldset` children contain a native `legend` and direct wrapping labels, `.field` containers or `.choice` labels. Deeper nested fieldsets/rows are not automatically styled.
- Direct `.actions` children contain buttons. `.primary` extends the primary button object. `.action-start` uses a logical auto margin, without reordering keyboard navigation. Give links their own `%o-button` extension if button presentation is appropriate.
- Keep these hooks out of unrelated nested components. Match existing application selectors to the smaller objects/patterns when adding the default hooks would be inappropriate. Do not deepen global descendant selectors to accommodate one application's markup.

## State and accessibility

Use native labels, types, `required`, `disabled`, `readonly`, `fieldset` and `legend`. Read-only is applicable to text-like inputs and textareas; it is not a replacement for disabling selects. The CSS does not change DOM order or turn links into buttons.

Keyboard focus uses `:focus-visible`. There is no removal of native appearance for choice, range, select, date or file controls. No animation or transition is needed for this baseline; forced colours retain browser control rendering.

The application sets `aria-invalid="true"` and connects error/help text with `aria-describedby`. Flair uses a dashed invalid border and `.field-error` text; it does not mark every empty required field invalid on page load. Read-only text fields use a dotted border. Error messages should say what needs to be corrected. Colour is not the only error indicator in the examples.

A disabled fieldset uses native disabled behaviour for its descendants. `aria-disabled` alone does not prevent an action; this version does not supply JavaScript behaviour for disabled links. Native buttons should use `disabled`.

## Theming

```scss
:root {
	@include flair.defaults;
	--theme-font-body: "Ubuntu", sans-serif;
	--theme-color-accent: #315c40;
}

.account-form {
	--theme-control-radius: .4rem;
	--theme-form-gap: var(--theme-space-6);
	--theme-field-min-width: 16rem;
}
```

Objects read public variables; they do not redefine them on every control. Changing the radius or control padding on a containing component therefore works by inheritance. Derived values use `var()` fallbacks at the declaration where they are consumed, so overriding a base colour or spacing step in a nested scope also works.

Call `defaults()` once for each independent root. Calling it on a nested component intentionally resets the public values in that scope. The website includes defaults once on `:root`. Example containers inherit the global theme and only override properties needed for local spacing demonstrations.

Theme authors should set the native `color-scheme` alongside their colours. Check foreground/background contrast, focus contrast and disabled readability for each theme. The font and colour defaults are monochrome; the example Paper theme is only a demonstration.

The Vivid theme demonstrates a yellow surface, purple text and borders, mint secondary buttons and lime primary buttons. It also changes control padding, field and action spacing, border width, corner radii and label weight. All changes use CSS properties in `style/site/root.scss`; the markup and library selectors are shared with the other themes. The local Compact option still overrides density settings when selected.

GitHub uses api.horse's light palette, Mona Sans font, 14px root size, grey control backgrounds, quarter-rem corners, blue focus rings and green primary buttons. Its button hover and pressed colours use the same colour mixing as api.horse. The references are api.horse's `style/variable/palette.scss`, `style/decoration/user-interface.scss`, `style/element/html.scss` and `style/element/button.scss`. Application-specific panel layouts and monospace field overrides are not part of this theme.

Material uses a Material 3 light palette, Roboto, 56px outlined controls, 40px rounded buttons, smaller labels and supporting text, and increased form spacing. Its values follow the [Material Web outlined field tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-outlined-text-field.scss) and [filled button tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-filled-button.scss). This is a styling theme for Flair's existing objects: labels remain above controls, and checkboxes, radios, selects and sliders retain native browser behaviour and appearance. Floating labels, ripples and custom Material widgets are not implemented.

Both themes apply through the global selector, including without JavaScript. Their self-hosted fonts and SIL Open Font Licences live in `asset/font/mona-sans/` and `asset/font/roboto/`; only the website imports their font definitions. Website heading fonts and selector borders, corners and shadows use separate `--site-*` properties. No website rules are included by the library entry point.

### Default properties

| Property | Default |
| --- | --- |
| `--theme-space-1` | `.25rem` |
| `--theme-space-2` | `.5rem` |
| `--theme-space-3` | `.75rem` |
| `--theme-space-4` | `1rem` |
| `--theme-space-6` | `1.5rem` |
| `--theme-space-8` | `2rem` |
| `--theme-color-text` | `#111` |
| `--theme-color-muted` | `#525252` |
| `--theme-color-surface` | `#fff` |
| `--theme-color-surface-disabled` | `#eee` |
| `--theme-color-border` | `#767676` |
| `--theme-color-accent` | `#111` |
| `--theme-color-on-accent` | `#fff` |
| `--theme-color-danger` | `#111` |
| `--theme-font-body` | `"Ubuntu", sans-serif` |
| `--theme-font-size` | `1rem` |
| `--theme-line-height` | `1.5` |
| `--theme-font-weight` | `400` |
| `--theme-label-weight` | `500` |
| `--theme-border-width` | `1px` |
| `--theme-radius` | `0` |
| `--theme-focus-width` | `3px` |
| `--theme-focus-offset` | `2px` |
| `--theme-control-min-height` | `2.75rem` |
| `--theme-choice-size` | `1.25rem` |
| `--theme-textarea-min-height` | `8rem` |
| `--theme-field-min-width` | `14rem` |

### Optional overrides

These are consumed with fallbacks; they are not assigned by `defaults()`.

| Property | Fallback |
| --- | --- |
| `--theme-focus-color` | `var(--theme-color-accent)` |
| `--theme-control-padding-block` | `var(--theme-space-2)` |
| `--theme-control-padding-inline` | `var(--theme-space-3)` |
| `--theme-control-border` | `var(--theme-color-border)` |
| `--theme-control-radius` | `var(--theme-radius)` |
| `--theme-control-background` | `var(--theme-color-surface)` |
| `--theme-control-text` | `var(--theme-color-text)` |
| `--theme-control-border-hover` | `var(--theme-color-text)` |
| `--theme-control-background-disabled` | `var(--theme-color-surface-disabled)` |
| `--theme-control-text-disabled` | `var(--theme-color-muted)` |
| `--theme-disabled-opacity` | `1` |
| `--theme-color-control-width` | `4rem` |
| `--theme-button-background` | `var(--theme-color-surface)` |
| `--theme-button-text` | `var(--theme-color-text)` |
| `--theme-button-weight` | `var(--theme-label-weight)` |
| `--theme-button-background-hover` | `var(--theme-color-surface-disabled)` |
| `--theme-button-primary-background` | `var(--theme-color-accent)` |
| `--theme-button-primary-text` | `var(--theme-color-on-accent)` |
| `--theme-button-primary-background-hover` | `var(--theme-color-text)` |
| `--theme-field-gap` | `var(--theme-space-2)` |
| `--theme-form-gap` | `var(--theme-space-4)` |
| `--theme-fieldset-padding` | `var(--theme-space-4)` |
| `--theme-actions-align` | `flex-end` |
| `--theme-actions-gap` | `var(--theme-space-3)` |
| `--theme-actions-margin` | `var(--theme-space-2)` |

### Additional theme properties

| Property | Fallback |
| --- | --- |
| `--theme-control-background-focus` | Control background, then surface |
| `--theme-control-focus-offset` | `var(--theme-focus-offset)` |
| `--theme-control-invalid-border-style` | `dashed` |
| `--theme-label-font-size` | `var(--theme-font-size)` |
| `--theme-message-font-size` | `var(--theme-font-size)` |
| `--theme-button-min-height` | Control minimum height |
| `--theme-button-padding-block` | Control block padding, then space 2 |
| `--theme-button-padding-inline` | Control inline padding, then space 3 |
| `--theme-button-radius` | Control radius, then general radius |
| `--theme-button-font-size` | `var(--theme-font-size)` |
| `--theme-button-border` | Control border, then general border |
| `--theme-button-border-hover` | Control hover border, then text colour |
| `--theme-button-primary-border` | Primary background, then accent |
| `--theme-button-primary-decoration-hover` | `underline` |
| `--theme-button-background-active` | Button hover background, then disabled surface |
| `--theme-button-primary-background-active` | Primary hover background, then text colour |
| `--theme-button-shadow-hover` | `none` |

## Available width

Forms and fields use the width supplied by their containing layout. The form pattern does not impose a maximum width. Field rows can wrap as that available width decreases.

The documentation website centres library page content and limits it to `--site-library-max-width` (80rem), with page gutters outside that measure. This is a website layout decision, shared by headings, examples and source listings. Implementing applications should choose their own container widths; individual controls can have narrower widths when their expected input warrants it.

## Sass output and override behaviour

`@use "flair"` alone produces no CSS. Extending one button includes its decoration and focus rules, but no form pattern. Extending the form pattern includes its complete dependency graph, even if one particular form does not contain every supported child. Sass does not inspect HTML to prune unused branches.

Extensions add selectors at the definition site. An `@extend` does not copy declarations into the location where it is written. Keep dependencies explicit with `@use`/`@forward`, extend simple placeholders, and use ordinary property overrides for application adjustments. Do not extend an outside placeholder from a media query; place responsive CSS property changes there instead.

Flair introduces no cascade layers, because a consuming application controls its own import order and adopting layers is its decision to make. The library uses no `!important`, no absolute positioning, no fixed width for a whole form, and no breakpoint-dependent field ordering.

## Composing with an application's own controls

- A shared control decoration in an application corresponds to `%d-control`, with `%o-control` and `%o-button` supplying the role-specific behaviour on top of it.
- Font and palette choices stay with the application, as overrides of the inherited properties, rather than being absorbed into the definition.
- A field decorator that arranges a label, a control and a message corresponds to `%o-form-field`, and the container that stacks several of them to `%p-form-fields`. Field rules living inside a larger panel decoration can be extracted to those two.
- A specialised input, such as a search field with its own icon and behaviour, can consume the control object while keeping its own layout.

Dimensions and palette mappings are worth comparing against the application they
come from before its own rules are removed.

## Verification

Run `npm test` for Sass API/output checks and `gt build` for the website build. In the browser, check `/library/controls/` and `/library/forms/` at narrow and wide widths, keyboard focus and choice navigation, disabled fieldsets, native required/email validation, global theme persistence, density inheritance and form submission without JavaScript.

Sources: [Sass extensions](https://sass-lang.com/documentation/at-rules/extend/), [WAI labels](https://www.w3.org/WAI/tutorials/forms/labels/), [WAI grouping](https://www.w3.org/WAI/tutorials/forms/grouping/), [WAI notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).
