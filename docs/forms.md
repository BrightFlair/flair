# Form foundations

This first implementation covers controls, field objects and `%p-form-fields`. It does not provide application validation, submission logic or data binding. The existing applications have not been migrated.

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

`style/flair.scss` emits no CSS by itself and imports no fonts. `defaults()` emits properties in the selector where it is included. Include it on the application root, or on the root of an independent theme preview. Load the fonts in your application, or override `--flair-font-body`.

Individual modules can be loaded instead of the aggregate entry point:

```scss
@use "path/to/flair/style/variable";
@use "path/to/flair/style/object/button";

:root {
	@include variable.defaults;
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
| `style/variable/index.scss` | `defaults()` | Monochrome values and shared scales; explicitly emitted by the consumer. |
| `style/decoration/focus-ring.scss` | `%d-focus-ring` | Outline width, colour and offset. |
| `style/decoration/control.scss` | `%d-control` | Shared font, padding, border, background, hover, disabled and explicit invalid presentation. Its `:focus-visible` rule extends `%d-focus-ring`. |
| `style/object/control.scss` | `%o-control` | Extends `%d-control`; full-width text-like controls, placeholder colour, read-only border and resizable textarea. |
| Same | `%o-choice` | Native checkbox/radio size and accent; extends focus ring on keyboard focus. |
| Same | `%o-range` | Native full-width range input; extends focus ring on keyboard focus. |
| Same | `%o-color` | Extends `%d-control`; smaller colour picker. |
| `style/object/button.scss` | `%o-button` | Extends `%d-control`; inline button or link presentation, alignment and colours. |
| Same | `%o-button-primary` | Extends `%o-button`; accent background with contrasting text. |
| `style/element/controls.scss` | `controls()` | Optional native-tag mappings to the objects above. |
| `style/object/form-field.scss` | `%o-form-field` | Label/control/message stack; includes direct-child element mappings. |
| Same | `%o-choice-field` | Checkbox/radio with wrapping text; extends `%o-choice` on the input. |
| Same | `%o-fieldset` | Native legend and bordered group; extends field and choice objects on its children. |
| `style/pattern/field-row.scss` | `%p-field-row` | Wrapping flex row; extends field objects on direct `.field` or `label` children. |
| `style/pattern/form-actions.scss` | `%p-form-actions` | Wrapping actions; extends button objects and primary variant. Preserves DOM order. |
| `style/pattern/form-fields.scss` | `%p-form-fields` | Field stack that composes field, choice, fieldset, row and action definitions. |

Element may depend on Object; Object/form-field may use Element/control mappings. This graph is acyclic: the element module only imports the control and button objects, not the form-field object. Directory order is not dependency order.

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
	--flair-font-body: "Ubuntu", sans-serif;
	--flair-color-accent: #315c40;
}

.account-form {
	--flair-control-radius: .4rem;
	--flair-form-gap: var(--flair-space-6);
	--flair-field-min-width: 16rem;
}
```

Objects read public variables; they do not redefine them on every control. Changing the radius or control padding on a containing component therefore works by inheritance. Derived values use `var()` fallbacks at the declaration where they are consumed, so overriding a base colour or spacing step in a nested scope also works.

Call `defaults()` once for each independent root. Calling it on a nested component intentionally resets the public values in that scope. The website includes defaults once on `:root`. Example containers inherit the global theme and only override properties needed for local spacing demonstrations.

Theme authors should set the native `color-scheme` alongside their colours. Check foreground/background contrast, focus contrast and disabled readability for each theme. The font and colour defaults are monochrome; the example Paper theme is only a demonstration.

The Vivid theme demonstrates a yellow surface, purple text and borders, mint secondary buttons and lime primary buttons. It also changes control padding, field and action spacing, border width, corner radii and label weight. All changes use CSS properties in `style/site/themes.scss`; the markup and library selectors are shared with the other themes. The local Compact option still overrides density settings when selected.

GitHub uses api.horse's light palette, Mona Sans font, 14px root size, grey control backgrounds, quarter-rem corners, blue focus rings and green primary buttons. Its button hover and pressed colours use the same colour mixing as api.horse. The references are api.horse's `style/variable/palette.scss`, `style/decoration/user-interface.scss`, `style/element/html.scss` and `style/element/button.scss`. Application-specific panel layouts and monospace field overrides are not part of this theme.

Material uses a Material 3 light palette, Roboto, 56px outlined controls, 40px rounded buttons, smaller labels and supporting text, and increased form spacing. Its values follow the [Material Web outlined field tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-outlined-text-field.scss) and [filled button tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-filled-button.scss). This is a styling theme for Flair's existing objects: labels remain above controls, and checkboxes, radios, selects and sliders retain native browser behaviour and appearance. Floating labels, ripples and custom Material widgets are not implemented.

Both themes apply through the global selector, including without JavaScript. Their self-hosted fonts and SIL Open Font Licences live in `asset/font/mona-sans/` and `asset/font/roboto/`; only the website imports their font definitions. Website heading fonts and selector borders, corners and shadows use separate `--site-*` properties. No website rules are included by the library entry point.

### Default properties

| Property | Default |
| --- | --- |
| `--flair-space-1` | `.25rem` |
| `--flair-space-2` | `.5rem` |
| `--flair-space-3` | `.75rem` |
| `--flair-space-4` | `1rem` |
| `--flair-space-6` | `1.5rem` |
| `--flair-space-8` | `2rem` |
| `--flair-color-text` | `#111` |
| `--flair-color-muted` | `#525252` |
| `--flair-color-surface` | `#fff` |
| `--flair-color-surface-disabled` | `#eee` |
| `--flair-color-border` | `#767676` |
| `--flair-color-accent` | `#111` |
| `--flair-color-on-accent` | `#fff` |
| `--flair-color-danger` | `#111` |
| `--flair-font-body` | `"Ubuntu", sans-serif` |
| `--flair-font-size` | `1rem` |
| `--flair-line-height` | `1.5` |
| `--flair-font-weight` | `400` |
| `--flair-label-weight` | `500` |
| `--flair-border-width` | `1px` |
| `--flair-radius` | `0` |
| `--flair-focus-width` | `3px` |
| `--flair-focus-offset` | `2px` |
| `--flair-control-min-height` | `2.75rem` |
| `--flair-choice-size` | `1.25rem` |
| `--flair-textarea-min-height` | `8rem` |
| `--flair-field-min-width` | `14rem` |

### Optional overrides

These are consumed with fallbacks; they are not assigned by `defaults()`.

| Property | Fallback |
| --- | --- |
| `--flair-focus-color` | `var(--flair-color-accent)` |
| `--flair-control-padding-block` | `var(--flair-space-2)` |
| `--flair-control-padding-inline` | `var(--flair-space-3)` |
| `--flair-control-border` | `var(--flair-color-border)` |
| `--flair-control-radius` | `var(--flair-radius)` |
| `--flair-control-background` | `var(--flair-color-surface)` |
| `--flair-control-text` | `var(--flair-color-text)` |
| `--flair-control-border-hover` | `var(--flair-color-text)` |
| `--flair-control-background-disabled` | `var(--flair-color-surface-disabled)` |
| `--flair-control-text-disabled` | `var(--flair-color-muted)` |
| `--flair-disabled-opacity` | `1` |
| `--flair-color-control-width` | `4rem` |
| `--flair-button-background` | `var(--flair-color-surface)` |
| `--flair-button-text` | `var(--flair-color-text)` |
| `--flair-button-weight` | `var(--flair-label-weight)` |
| `--flair-button-background-hover` | `var(--flair-color-surface-disabled)` |
| `--flair-button-primary-background` | `var(--flair-color-accent)` |
| `--flair-button-primary-text` | `var(--flair-color-on-accent)` |
| `--flair-button-primary-background-hover` | `var(--flair-color-text)` |
| `--flair-field-gap` | `var(--flair-space-2)` |
| `--flair-form-gap` | `var(--flair-space-4)` |
| `--flair-fieldset-padding` | `var(--flair-space-4)` |
| `--flair-actions-align` | `flex-end` |
| `--flair-actions-gap` | `var(--flair-space-3)` |
| `--flair-actions-margin` | `var(--flair-space-2)` |

### Additional theme properties

| Property | Fallback |
| --- | --- |
| `--flair-control-background-focus` | Control background, then surface |
| `--flair-control-focus-offset` | `var(--flair-focus-offset)` |
| `--flair-control-invalid-border-style` | `dashed` |
| `--flair-label-font-size` | `var(--flair-font-size)` |
| `--flair-message-font-size` | `var(--flair-font-size)` |
| `--flair-button-min-height` | Control minimum height |
| `--flair-button-padding-block` | Control block padding, then space 2 |
| `--flair-button-padding-inline` | Control inline padding, then space 3 |
| `--flair-button-radius` | Control radius, then general radius |
| `--flair-button-font-size` | `var(--flair-font-size)` |
| `--flair-button-border` | Control border, then general border |
| `--flair-button-border-hover` | Control hover border, then text colour |
| `--flair-button-primary-border` | Primary background, then accent |
| `--flair-button-primary-decoration-hover` | `underline` |
| `--flair-button-background-active` | Button hover background, then disabled surface |
| `--flair-button-primary-background-active` | Primary hover background, then text colour |
| `--flair-button-shadow-hover` | `none` |

## Available width

Forms and fields use the width supplied by their containing layout. The form pattern does not impose a maximum width. Field rows can wrap as that available width decreases.

The documentation website centres library page content and limits it to `--site-library-max-width` (80rem), with page gutters outside that measure. This is a website layout decision, shared by headings, examples and source listings. Implementing applications should choose their own container widths; individual controls can have narrower widths when their expected input warrants it.

## Sass output and override behaviour

`@use "flair"` alone produces no CSS. Extending one button includes its decoration and focus rules, but no form pattern. Extending the form pattern includes its complete dependency graph, even if one particular form does not contain every supported child. Sass does not inspect HTML to prune unused branches.

Extensions add selectors at the definition site. An `@extend` does not copy declarations into the location where it is written. Keep dependencies explicit with `@use`/`@forward`, extend simple placeholders, and use ordinary property overrides for application adjustments. Do not extend an outside placeholder from a media query; place responsive CSS property changes there instead.

No cascade layers are introduced in this first implementation. Existing applications use different import orders, so layer adoption needs a separate migration decision. No `!important`, absolute positioning, fixed widths for whole forms or breakpoint-dependent field ordering is used in the library.

## Relationship to existing applications

- Hexform's `%d-ui` and dhp-logging's `%d-ui` correspond to `%d-control`, with `%o-control` and `%o-button` supplying role-specific behaviour.
- api.horse's `%d-user-interface` has the same shared treatment, but its font and palette choices remain application overrides.
- Hexform/dhp-logging form-field decorators correspond to the form-field object and `%p-form-fields` pattern. api.horse's field rules currently live inside its panel decoration and can be extracted separately.
- The specialised PHP.GT search input can consume a control object while retaining its search layout, icon and behaviour.

This is a common baseline for review, not a drop-in visual migration. Palette mappings, exact dimensions and application-specific variants must be verified against each application before replacement.

## Verification

Run `npm test` for Sass API/output checks and `gt build` for the website build. In the browser, check `/library/controls/` and `/library/forms/` at narrow and wide widths, keyboard focus and choice navigation, disabled fieldsets, native required/email validation, global theme persistence, density inheritance and form submission without JavaScript.

Sources: [Sass extensions](https://sass-lang.com/documentation/at-rules/extend/), [WAI labels](https://www.w3.org/WAI/tutorials/forms/labels/), [WAI grouping](https://www.w3.org/WAI/tutorials/forms/grouping/), [WAI notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).
