# Article reading layouts

`%l-reading` lays out one contents sidebar (`aside`) followed by
`.reading-content`. On smaller screens the contents sits above the prose and
can stay at the top during reading. At `$break-wide`, the same DOM becomes a
main column and sticky right sidebar. Column weights are configurable using
`--theme-reading-main` and `--theme-reading-aside`; the sticky offset uses
`--theme-sticky-offset`.

`%p-contents` styles a semantic navigation element with an `h2` label and an
`ol` of ordinary anchor links. Links scroll horizontally on small screens,
then form a vertical list alongside the reading column. Use real heading IDs,
not JavaScript click handlers. The inset uses `--theme-contents-background`.

`%o-article-picture` provides the same 3:2 media geometry used by
`%o-article-preview`; override `--theme-article-picture-ratio` for other figures.
Prose media is contained by `%p-prose` without changing the theme's colours.

`%d-highlight-frame` extends the centred highlight: its horizontal rules reach
the viewport edges, while the corner markers remain at the element's corners.
Contain horizontal overflow at the page boundary. It can be shared by article
frames, pricing grids and footers.

All definitions are monochrome under the base theme, emit no selectors until
extended, and leave colour accents and branded typography to the site theme.
