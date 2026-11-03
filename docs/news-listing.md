# Article previews and page pickers

`%o-article-preview` composes a card and linked stack. Its anchor can contain
`.article-picture`, `.article-meta`, `.article-title` and `.article-summary`.
A single anchor makes the whole preview one keyboard target. Pictures use a
3:2 ratio by default (`--theme-article-picture-ratio`); typography and colours
come from the active theme. Combine with `%l-grid` for a responsive listing.

`%o-page-picker` extends a native `details` disclosure. Use a descriptive
`summary` (for example an ellipsis with an accessible “Show all pages” label)
and an `ol.disclosure-content` containing page links. Its containing navigation
should be positioned and its summary/links can extend `%o-button`. The list
wraps and scrolls above `--theme-page-picker-height` (12rem by default). Use
`aria-current="page"` on current links. Page URLs and omission rules are the
application’s responsibility; there is no JavaScript or automatic content.

Both objects are monochrome under the base theme and emit nothing until extended.
