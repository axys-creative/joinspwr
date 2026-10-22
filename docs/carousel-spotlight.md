# Carousel Spotlight

Copied from axys-template. Prop docs from `src/lib/library/component-props.ts`:

```ts
export const carouselSpotlightProps = props(
	[
		'eyebrowText, eyebrowIcon, title, description, cta',
		'The section copy, centered above the carousel, from Section Copy (see the Style Guide).'
	],
	[
		'slides',
		'An array of `{ title, description, image }`, two or more. `image` is `{ src, alt }`. The title and description sit in a blurred glass panel over the picture. Required.'
	],
	['label', 'A string, the accessible name of the carousel. Defaults to `Featured`.'],
	[
		'loop',
		'A boolean. An endless loop, so the last slide sits to the left of the first. Without it the carousel starts and stops at its ends. Defaults to `true`.'
	],
	[
		'autoplay',
		'A boolean. Moves on by itself. It waits while focus is inside the carousel, while it is off screen and with reduced motion, and a touch or key press holds it for one interval. Defaults to `true`.'
	],
	[
		'pauseOnHover',
		'A boolean. Holds autoplay while the mouse is over the carousel. Focus inside it always holds it. Defaults to `false`.'
	],
	['interval', 'A number, the milliseconds between slides when it plays. Defaults to `2400`.'],
	[
		'fullScreen',
		'A boolean. At least the height of the screen, with the content centered. Defaults to `false`.'
	],
	['id', 'A string, the section’s anchor.'],
	[
		'class',
		'A string of extra classes, such as `full` on a Library page. The look is set with CSS variables on the section: `--slide-width`, `--slide-gap`, `--slide-radius`, `--slide-aspect`, `--inactive-opacity`, `--panel-offset`, `--panel-radius` and `--panel-width`.'
	]
);
```
