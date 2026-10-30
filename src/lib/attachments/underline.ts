import type { Attachment } from 'svelte/attachments';
import './underline.scss';

export type UnderlineOptions = {
	/** Underlines every element inside that matches, such as `a` in rich text, instead of the one label. They are found again when the content changes. */
	selector?: string;
};

/** Draws a line under a button's label that slides away on hover. Works with any Button type. */
export function underline({ selector }: UnderlineOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (!selector) {
			const target = el.querySelector<HTMLElement>('.label') ?? el;
			target.classList.add('underline-effect');
			return () => target.classList.remove('underline-effect');
		}

		const marked = new Set<HTMLElement>();
		const mark = () =>
			el.querySelectorAll<HTMLElement>(selector).forEach((target) => {
				target.classList.add('underline-effect', 'underline-effect--self');
				marked.add(target);
			});
		mark();
		const observer = new MutationObserver(mark);
		observer.observe(el, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
			marked.forEach((target) =>
				target.classList.remove('underline-effect', 'underline-effect--self')
			);
		};
	};
}
