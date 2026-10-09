# Prompt: add the Hero Gnomon section to this starter template

Copy this whole file into the Claude instance working in the starter template. The source lives in the joinspwr repo at
`/Users/aarongarcia/Desktop/work/axys-creative/projects/joinspwr` (read from there; do not guess). Port it, adapt it to
this template's conventions, and tell me anything you changed or could not match.

## What it is

`sections/hero-gnomon.svelte`: a full-width hero built on the gnomon frame. A rounded picture carousel with notches cut
into its bottom edge:

- Bottom left notch: the active slide's title (an h-level heading).
- Bottom right notch: the controls (optional date, an info button, prev and next arrows).
- The info button opens an overlay inside the frame with the slide's description and an optional button.
- Optional transparent cutout pictures ("figures") that stand in the bottom corners of the frame on every slide, on top
  of the notches.
- Optional intro above the frame: a centered page heading (the page's h1) and a description under it.
- Below `md` the title notch moves to the top left and the controls stay bottom right.

It is a copy-once template feature, so it must be removable by deleting its own files and imports.

## Files to copy or port (read each from joinspwr)

1. `src/lib/sections/hero-gnomon.svelte`: the section itself (props, measuring, shape, autoplay, overlay, styles).
2. `src/lib/utils/gnomon.ts`: needs `EdgeNotch` and `edgeNotchBoxPath` (new), plus `roundedBoxPath`
   (and its private `roundedPolygonPath`). Add only what the starter lacks. Do not break `gnomonShape` or
   `notchedBoxPath`.
3. Content: `src/lib/content/page_culture/hero-gnomon.json` is the example shape. In the starter, name it for the page
   it lives on (`page_<name>/hero-gnomon.json`).
4. CMS: the `hero_gnomon` entry in `src/routes/admin/config.json` (page_culture collection) and the `hero_gnomon`
   entry in `src/routes/admin/previews.ts` (imports `HeroGnomon`; props pass `slides: data.slides ?? []` and
   `autoplay: undefined` so the preview does not rotate).
5. Docs: `heroGnomonProps` in `src/lib/library/component-props.ts` and the "Hero Gnomon" `LibrarySection` in
   `src/routes/(site)/(library)/sections/+page.svelte` (title `Hero Gnomon`, type `Section`, `class="full"`,
   `fullScreen={false}`, two sample slides using the template's sample images).
6. Assets used by the example: `static/uploads/competition-*.png` (slide pictures) and
   `static/uploads/culture-hero-rep-left.png` / `-right.png` (figures). Use whatever sample images the starter has;
   do not copy client photos.

## Dependencies the starter must already provide (check each, adapt if different)

- `components/button.svelte` with props `iconStart`, `textDescription`, `expanded`, `controls`, `onclick`, and the
  icons `x-lg`, `info-circle`, `chevron-right` in `static/icons`.
- `components/cta-group.svelte`, `components/rich-text.svelte`, `components/section-copy.svelte`
  (props used: `level`, `titleStyle`, `layout`, `align`, `title`, `description`, `showEyebrow`, `showDescription`,
  `showCta`).
- `utils/image.ts` `imageProps` (Netlify Image CDN `srcset`).
- SCSS: `@use 'base/mixins'` with `min-md`, `max-md`, `mq-motion-allow`; the `.page-grid` utility (the section is a
  `page-grid` and its children sit in the content column); tokens `--color-surface`, `--color-border`,
  `--color-text-muted`, `--ease`.

## How it works (so you can re-derive it if the code differs)

- **One shape, two layers.** The shell is measured with `bind:clientWidth/clientHeight`. `edgeNotchBoxPath(width,
height, notches, radius, angle)` returns an SVG path in px (so corners stay round at any size). That one path is
  both the `clip-path: path()` on the picture surface and the stroke `<svg>`, so the picture edge sits exactly on the
  line. No shape is drawn until the shell is measured, so SSR shows no frame until hydration.
- **Notch sizes come from content.** Each notch's height is bound from its element (`bind:clientHeight`). Notch
  padding on the inner side leaves room for the leaning wall (`NOTCH_PADDING = 48`).
- **The title notch is dynamic.** Every slide's title sits in the same grid cell (`grid-area: 1 / 1`,
  `justify-self: start`, so each cell shrinks to its own text). Each slide's width is bound into
  `slideWidths[i]`. The title notch width is `slideWidths[index] + NOTCH_PADDING`, run through a Svelte `Tween` (450ms,
  `cubicOut`) so it eases when the slide changes. Rules: apply instantly the first time, on resize, and after the web
  font loads (only ease when `index` actually changed); apply instantly under `prefers-reduced-motion`. The controls
  notch is sized to its own content (`arrowsWidth + NOTCH_PADDING`); the two notches are independent. Titles are
  `white-space: nowrap`, so never add manual line breaks to slide titles: the notch just takes the intrinsic width.
- **Compact (< 768px).** `matchMedia('(max-width: 767px)')` flips `compact`: the title notch moves to the top left
  (`edge: 'top'`), the shell reserves `--notch-top`, and the left figure stands at the very bottom.
- **Min height.** `.shell` is `max(650px, 50lvh, notches + 320px)`; with `fullScreen` it is
  `max(100lvh - 168px, notches + 320px)`. Taller content grows; never a fixed height. The section's top margin clears
  the floating header (120px; 96px below md). When an intro is present it is 184px (136px below md).
- **Slides.** All pictures are stacked and cross-fade (`opacity` 0.8s), only the active one has an `alt`
  and the rest are `aria-hidden`. The first loads `eager` + `fetchpriority="high"`. Inactive title slides are
  `inert` + `visibility: hidden`.
- **Autoplay.** Off unless `autoplay.enabled`. Pauses while hovered or focused or while the overlay is open; off under
  reduced motion. The effect depends on `index` so a manual change restarts the countdown.
- **Info overlay.** A `position:absolute` panel inside the frame, `inert` when closed, closes with Escape (window
  `keydown`) or the button. It follows the slide. The button is only rendered when some slide has a description.
- **Intro.** When `title` is set, a `SectionCopy` (`level={1}`, `align="center"`, eyebrow and cta hidden) renders above
  the frame, and slide titles drop to `level 2` so the page has exactly one h1. Inside `.intro` the copy block is
  widened (`max-width: 1000px`, description `640px`) as a one-off. Do not change `section-copy.svelte` for this.
- **Accessibility.** Section is `aria-roledescription="carousel"` with an `aria-label`; each title cell is a `slide`
  group "n of N"; live region is `off` while autoplay runs; Buttons have accessible names; all motion is gated
  with `mq-motion-allow`.

## Props (from `HeroGnomonProps`)

`slides` (required; `{ title, date?, description?, cta?, image: { src, alt? } }`), `label`, `title`, `description`
(the intro), `figures` (`{ left?, right? }` each `{ src, alt? }`), `autoplay` (`{ enabled?, interval? }`, default
interval 6000), `fit` (`cover | contain`), `angle` (45-90, default 70), `radius` (default 28), `borderWidth` (default
2), `fullScreen` (default `false`; document it in `component-props.ts` per this template's rule), `id`, `class`.

## Rules to follow in the starter

- Follow the starter's CLAUDE.md: deletable feature, scoped component SCSS with plain class names, tokens from
  `base/_variables.scss`, minimal comments (one short "why" sentence at most), content JSON with matching Decap fields,
  previews mount the real component, library entry titled `[ Hero Gnomon - Section ]`, alphabetical within the page,
  and the `fullScreen` boolean documented.
- Add a short CLAUDE.md rule describing it (what it is, the dynamic title notch, that titles take intrinsic width, and
  that deleting the section file plus its content, CMS entry and library entry removes it).
- Keep the Library page pattern: if the library only holds sections that exist in the starter, add the demo there and
  tag anything library-only with `LIBRARY: DELETE ME` as the rest of the template does.

## Verify

1. `bun run check`, `bun run lint`, `bun run build`.
2. In the browser at >= 1024px and < 768px: slides cross-fade, the title notch resizes to each title, the controls
   work, the info overlay opens and closes (also with Escape), autoplay pauses on hover, and the frame stroke and the
   picture edge line up.
3. Reduced motion: no autoplay, no tween (the notch snaps).
4. Testing tip: a background or hidden browser tab pauses `requestAnimationFrame`, which stalls the Svelte `Tween`.
   If the notch width seems stuck while verifying, make sure the tab is visible before suspecting the code.

## Related, separate change (do it too if the starter has Card Gnomon)

Card Gnomon `length="auto"` fits a cutout to its text (plus `lengthPadding`, default 28px, capped at 90%). It was
documented in a separate note; the code is in joinspwr's `src/lib/components/card-gnomon.svelte` (hidden `.label.measure`
spans bound with `bind:clientWidth`). It is independent of Hero Gnomon.
