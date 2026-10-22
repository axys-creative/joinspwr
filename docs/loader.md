# Loader

Copied from axys-template. The paragraphs below are from its CLAUDE.md.

**Loaders.** A loader is a full-screen cover shown while the page loads, on a hard load or refresh only (a layout persists across in-app navigation). `components/loader.svelte` is the shell every loader shares: progress, the minimum and maximum time, scroll lock, the exit, `loading.done` and the `--progress` and `--exit` variables. Each look is its own file, `components/loader-<name>.svelte` (`counter`, `bar`, `logo`, `curtain`, `grid`), that renders inside the shell and takes `LoaderOptions` (`minDuration`, `maxDuration`, `track`, `contained`, `onfinish`, `class`). Progress is real, from `utils/loading.svelte.ts` (`trackLoad`: fonts and the pictures in the first screen), and the animation never runs faster than `minDuration`, so a fast connection plays it straight through. To use one, mount it once in `routes/(site)/+layout.svelte` ahead of `.site`; none is mounted by default. To add a look, copy a `loader-*.svelte`, change its markup and CSS (the root is styled with `:global(.loader-name)` and `[data-phase='leaving']` for the exit) and add an entry on `/intros`. `loading.done` is false while a loader shows and true when there is none; a hero with a load animation gates its reveal on it (`hero-load-*`), so any loader pairs with any hero. Delete `loader.svelte` and `utils/loading.svelte.ts` only once no loader or hero imports them. `track` replaces the page tracking with your own signal; `contained` is for previews only.

**Library (documentation pages).** The pages that document the template (`/style-guide`, `/components`, `/attachments`, `/combos`, `/intros`, `/sections`, `/transitions`, `/advanced`) are the library. Every one opens with `HeroSimple`, and every entry uses `src/lib/library/library-section.svelte`: a `[ Title - Type ]` heading (Type is Attachment, Component, Combo, Hero, Intro, Section, Transition or Tokens). `/advanced` holds heavier canvas and SVG behavior. `/intros` holds everything that plays when a page loads, tagged Loader or Hero: loaders (full-screen covers) and heroes whose loading sequence plays on a hard load or refresh (not on in-app navigation). Each demo sits in `library/intro-frame.svelte`, a mock window with a "Play animation" button under it that remounts it, so a hero must start in `onMount` and stay inside the frame (position `absolute`, never `fixed`); a loader is shown with `contained` and a fake `track` from `library/simulate-load.ts`. Small building blocks (button, icon, tag) go in the style guide; larger behavior-owning components (mouse cursor, theme toggle, video overlay) go in `/components`, a brief description, then the options or props as `<ul class="classic-list"><li><code>name</code> description</li></ul>`. Keep entries alphabetical within a page. When you add or change an attachment, component, combo or section, add or update its entry; the prop text lives in `src/lib/library/component-props.ts` (components, sections) or inline on the page (attachments).

## Prop docs (from src/lib/library/component-props.ts)

`/intros` imports `loaderProps`, `loaderGridProps`, `loaderLogoProps`, `heroLoadSlideProps` and `heroLoadMarqueeSlideProps` from `$lib/library/component-props`. Add them to joinspwr's copy of that file.

```ts
export const loaderProps = props(
	[
		'minDuration',
		'A number of milliseconds, the fastest the count can run, so a quick connection still plays the animation through. Defaults to `900`.'
	],
	[
		'maxDuration',
		'A number of milliseconds after which it finishes even if the page is still loading. Defaults to `8000`.'
	],
	[
		'track',
		"A function `(update) => stop` that calls `update(progress)` with a number from `0` to `1` and returns a function that stops it. Defaults to watching the page's fonts and the pictures at the top of it; pass your own to wait on something else, such as a video."
	],
	[
		'contained',
		'A boolean. Keeps the loader inside its parent and leaves the page alone (no scroll lock, and `loading.done` is untouched). For previews; leave it off on a site.'
	],
	['onfinish', 'A function that runs when the loader has gone.'],
	['class', 'A string of extra classes, e.g. a `theme-*` surface.']
);

export const loaderGridProps = loaderProps;

export const loaderLogoProps = [
	{ name: 'logo', description: 'An object of Logo props, the logo that fills in. Required.' },
	...loaderProps
];

export const heroLoadMarqueeSlideProps = props(
	[
		'...SectionCopy props',
		'Takes `eyebrowText`, `eyebrowIcon`, `description`, `cta` and the rest of Section Copy (see the Style Guide). The eyebrow (if set) sits above the words; the description and buttons sit to the right of the first word, and under it below `md`. From `md` up the second and third rows are indented 96px and 192px. `title` is not used; the heading comes from `words`.'
	],
	[
		'words',
		"A tuple of three: a string, an array of strings, a string, top to bottom, e.g. `['A better way to', ['live', 'think', 'feel'], 'starts here']`. The array is the marquee: its first word is revealed in place, then it starts looping and the rest fade in. Together they make the page heading. Required."
	],
	[
		'size',
		'A string, any CSS length for the font size of the words. Defaults to `clamp(72px, 15vw, 180px)`.'
	],
	[
		'divider',
		"A string, the mark between the looping words (and after the last, before it starts over), so the line does not read as a sentence. It is muted and fades in with the words. Any text works, e.g. `'·'`, `'/'` or `'✦'`; an empty string shows none. Defaults to `'·'`."
	],
	[
		'speed',
		'A number, pixels per second the middle line slides once its first word has revealed. Defaults to `120`.'
	],
	[
		'fullScreen',
		'A boolean. At least the height of the screen. Taller content still grows past it. Defaults to `true`.'
	],
	[
		'static',
		'A boolean. Skips the reveal and the slide, for the CMS preview. Defaults to `false`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);

export const heroLoadSlideProps = props(
	[
		'...SectionCopy props',
		'Takes `eyebrowText`, `eyebrowIcon`, `description`, `cta` and the rest of Section Copy (see the Style Guide). The eyebrow (if set) sits above the words; the description and buttons sit to the right of the first word, and under it below `md`. From `md` up the second and third rows start indented 96px and 192px and slide left to line up with the first once they have revealed. `title` is not used; the heading comes from `words`.'
	],
	[
		'words',
		'An array of exactly three strings, top to bottom. Together they make the page heading. Required.'
	],
	[
		'size',
		'A string, any CSS length for the font size of the words. Defaults to `clamp(72px, 15vw, 180px)`.'
	],
	[
		'fullScreen',
		'A boolean. At least the height of the screen. Taller content still grows past it. Defaults to `true`.'
	],
	[
		'static',
		'A boolean. Skips the reveal and the slide, for the CMS preview. Defaults to `false`.'
	],
	['class', 'A string of extra classes, such as `full` on a Library page.']
);
```

## Needs in joinspwr

- `--z-loading: 30;` in the variables stylesheet (not defined there yet).
- The `/intros` entry in nav (`navEntry('/intros')`).
