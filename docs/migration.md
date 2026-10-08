# New Flair integration

The old themes are removed. Sass uses lowercase names: `base`, `bright`,
`github`, `clean`, and `gt`; the displayed names are Monochrome, Bright,
GitHub, Clean and GT. Every preset includes the base. To review a neutral
interface, include `theme.base` in place of the preset.

```scss
@use "flair";
@use "theme/bright";
:root { @include bright.bright; }
@include flair.base;
@include flair.controls;
```

Only opt into the native defaults the application needs. Use `%o-button` on
either a button or an action link. Layout and content selectors live in the
application. See [architecture.md](architecture.md) for the ownership changes,
and the live library sections for markup and Sass.

## Reference checkout dependencies

The reference projects deliberately depend on the sibling Flair checkout using
npm `file:` dependencies. Their lockfiles record those paths. Run `npm install`
in each project after checking out its new branch. The directory arrangement
matches `~/Code/{BrightFlair,Authwave,PhpGt,g105b}`. Deployments need that same
relative layout or a packed/released Flair dependency; no unpublished Git commit
is assumed.

| Project | Theme | Build |
| --- | --- | --- |
| Flair examples | Base by default; picker offers all five | `vendor/bin/build --default vendor/phpgt/webengine/build.default.ini` |
| Authwave/provider | Bright; base available at runtime | `npm run test:ui` builds and checks templates, login interactions and admin screens |
| api.horse | GitHub | `node_modules/.bin/sass style/style.scss www/style.css --no-source-map` |
| www.php.gt | GT | `node_modules/.bin/sass style/style.scss www/style.css --no-source-map` |
| dhp-logging | Clean | `npm run build:style` |
| Flux examples | Base | `npm run build --prefix examples` from the Flux repository |

## Provider theme selection

Visit any Provider route with `?flairTheme=base` to use the monochrome interface,
or `?flairTheme=bright` to restore Bright. The server records the preference in
the `authwave-flair-theme` cookie, so ordinary navigation and no-JavaScript
requests retain it. The default markup remains Bright. The small browser adapter
also supports standalone fixtures with the same query parameter.

Stored application theme JSON keeps its existing property names and validation;
its generated CSS now targets Flair's role tokens and is scoped to Bright.
Monochrome therefore stays monochrome even for branded customer deployments.
Charts resolve CSS colours through the browser before passing them to ECharts,
so `light-dark()` and token aliases work in both schemes.

Bright retains Provider's warm surfaces, purple primary/secondary colours,
rounded controls and bevels. Muted text and status text are slightly darker in
the light scheme to meet text contrast; coloured status dots keep the original
indicator colours. Layout is identical between base and Bright apart from
font metrics, borders and control padding chosen by the theme.

## Validation

`npm test` in Flair validates the publishable package and the layer contracts.
Optional browser scripts use Playwright and `@axe-core/playwright` (see
[library.md](library.md)). They cover every theme, responsive widths, dark
schemes, native form submission and navigation. API Horse's Behat suite also
checks request editing, secrets and theme switching. Flux's Vitest suite checks
its interaction behavior independently of its example presentation.

GitHub retains the reference palette and control dimensions. Its light-scheme
primary hover/press colours darken slightly to retain white-text contrast; the
dark-scheme hover/press mixing remains unchanged.
