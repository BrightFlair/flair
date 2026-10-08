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
| `style/decoration/control.scss` | `%d-control` | Shared font, border, background, hover, disabled and explicit invalid appearance. Its `:focus-visible` rule extends `%d-focus-ring`. |
| `style/object/control.scss` | `%o-control` | Extends `%o-interactive`; full-width text-like controls, placeholder colour, read-only border and resizable textarea. |
| `style/object/choice.scss` | `%o-choice` | Native checkbox/radio size and accent; extends focus ring on keyboard focus. |
| `style/object/range.scss` | `%o-range` | Native full-width range input; extends focus ring on keyboard focus. |
| `style/object/color.scss` | `%o-color` | Extends `%d-control`; smaller colour picker. |
| `style/object/button.scss` | `%o-button` | Extends `%o-interactive`; inline button or link presentation, alignment and colours. |
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
	--theme-color-tint: #8a4168;
}

.account-form {
	--theme-control-radius: .4rem;
	--theme-form-gap: var(--theme-space-6);
	--theme-field-min-width: 16rem;
}
```

Objects read public variables; they do not redefine them on every control. Changing the radius or control padding on a containing component therefore works by inheritance. Derived values use `var()` fallbacks at the declaration where they are consumed, so overriding a base colour or spacing step in a nested scope also works.

Call `defaults()` once for each independent root. Calling it on a nested component intentionally resets the public values in that scope. The website includes defaults once on `:root`. Example containers inherit the global theme and only override properties needed for local spacing demonstrations.

Themes include the base colour-scheme support before overriding values. Check foreground/background contrast, focus contrast and disabled readability in both schemes. The website offers the five current themes; applications own any font downloads. See [architecture.md](architecture.md) for the ownership rules and [migration.md](migration.md) for reference project setup.

The old presets are retired. Base is monochrome; Bright supplies Authwave's warm surfaces and bevels, GitHub supplies API Horse's existing treatment, Clean supplies DHP Logging's blue interface, and GT supplies the PHP.GT website palette. All use the same native controls and form relationships.
