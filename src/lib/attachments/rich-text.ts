import type { Attachment } from 'svelte/attachments';
import './rich-text.scss';
import type { ScribbleOptions } from './scribble';
import { textRollLoop } from './text-roll-loop';

const circleScales: Record<string, number> = {
	'scribble-circle': 1,
	'scribble-circle-tight': 0.8,
	'scribble-circle-wide': 1.2
};

/** Starts the behavior of the rich-text spans that need one: the scribble under `.scribble` (a different curve for each word) and around `.scribble-circle` (`-tight` and `-wide` sit closer and farther out), drawn in each time it scrolls into view. `.roll` words roll their letters up every few seconds. */
export function richTextBehaviors(text?: string): Attachment<HTMLElement> {
	return (el) => {
		if (!text) return;

		const cleanups: (() => void)[] = [];
		// Each `.roll` waits a little longer for its first roll, so they never move together.
		el.querySelectorAll<HTMLElement>('[data-rich-text-roll]').forEach((span, index) => {
			const cleanup = textRollLoop({ delay: 5 + index * 2.5 })(span);
			if (typeof cleanup === 'function') cleanups.push(cleanup);
		});

		const spans = el.querySelectorAll<HTMLElement>('[data-rich-text^="scribble"]');
		if (!spans.length) return () => cleanups.forEach((cleanup) => cleanup());

		let cancelled = false;

		import('./scribble').then(({ scribble }) => {
			if (cancelled) return;
			// The CMS preview is an iframe that the page's scroll does not move, so it shows the scribble from the start.
			const scroll = el.ownerDocument === document;
			for (const span of spans) {
				const kind = span.dataset.richText ?? '';
				const options: ScribbleOptions = kind.startsWith('scribble-circle')
					? { type: 'circle', scale: circleScales[kind], thickness: 0.2, scroll, once: false }
					: {
							curve: kind === 'scribble-zigzag' ? 'zigzag' : 'random',
							thickness: 0.2,
							scroll,
							once: false
						};
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
