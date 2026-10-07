import type { Attachment } from 'svelte/attachments';
import './rich-text.scss';
import type { ScribbleOptions } from './scribble';

/** Starts the behavior of the rich-text spans that need one: the scribble under `.scribble` and around `.scribble-circle`, drawn in each time it scrolls into view. */
export function richTextBehaviors(text?: string): Attachment<HTMLElement> {
	return (el) => {
		const spans = el.querySelectorAll<HTMLElement>('[data-rich-text^="scribble"]');
		if (!text || !spans.length) return;

		let cancelled = false;
		const cleanups: (() => void)[] = [];

		import('./scribble').then(({ scribble }) => {
			if (cancelled) return;
			// The CMS preview is an iframe that the page's scroll does not move, so it shows the scribble from the start.
			const scroll = el.ownerDocument === document;
			for (const span of spans) {
				const options: ScribbleOptions =
					span.dataset.richText === 'scribble-circle'
						? { type: 'circle', thickness: 0.2, scroll, once: false }
						: { curve: 'zigzag', thickness: 0.2, scroll, once: false };
				const cleanup = scribble(options)(span);
				if (typeof cleanup === 'function') cleanups.push(cleanup);
			}
		});

		return () => {
			cancelled = true;
			cleanups.forEach((cleanup) => cleanup());
		};
	};
}
