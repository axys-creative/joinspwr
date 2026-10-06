import type { Attachment } from 'svelte/attachments';
import './rich-text.scss';

/** Starts the behavior of the rich-text spans that need one: for now, the scribble under `.scribble`. */
export function richTextBehaviors(text?: string): Attachment<HTMLElement> {
	return (el) => {
		const spans = el.querySelectorAll<HTMLElement>('[data-rich-text="scribble"]');
		if (!text || !spans.length) return;

		let cancelled = false;
		const cleanups: (() => void)[] = [];

		import('./scribble').then(({ scribble }) => {
			if (cancelled) return;
			for (const span of spans) {
				const cleanup = scribble({ curve: 'zigzag', thickness: 0.12 })(span);
				if (typeof cleanup === 'function') cleanups.push(cleanup);
			}
		});

		return () => {
			cancelled = true;
			cleanups.forEach((cleanup) => cleanup());
		};
	};
}
