import type { Attachment } from 'svelte/attachments';
import './text-roll-loop.scss';

export type TextRollLoopOptions = {
	/** Seconds between each roll. */
	interval?: number;
	/** Seconds before the first roll, to keep several loops out of step. Defaults to `interval`. */
	delay?: number;
	/** Seconds between each letter starting to roll. */
	stagger?: number;
	/** Seconds each letter takes to roll. */
	duration?: number;
	/** `up` rolls letters out the top; `right` rolls them out the right, each replaced by a copy from the left. */
	direction?: 'up' | 'right';
	/** Checked after each roll; once it returns true the loop stops, letters at rest. */
	until?: () => boolean;
};

/** Rolls each letter out on a timer, replaced by a copy coming in behind it, then starts over. */
export function textRollLoop({
	interval = 5,
	delay = interval,
	stagger = 0.04,
	duration = 0.6,
	direction = 'up',
	until
}: TextRollLoopOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const original = Array.from(el.childNodes);
		const text = el.textContent ?? '';

		const readable = document.createElement('span');
		readable.className = 'visually-hidden';
		readable.textContent = text;

		const chars = document.createElement('span');
		chars.className = 'text-roll-loop__chars';
		chars.setAttribute('aria-hidden', 'true');
		const spans = [...text].map((char, index) => {
			const span = document.createElement('span');
			span.className = 'text-roll-loop__char';
			if (direction === 'right') {
				const inner = document.createElement('span');
				inner.className = 'text-roll-loop__inner';
				inner.dataset.char = char;
				inner.textContent = char;
				span.append(inner);
			} else {
				span.dataset.char = char;
				span.textContent = char;
			}
			span.style.setProperty('--text-roll-index', String(index));
			chars.append(span);
			return span;
		});

		el.replaceChildren(readable, chars);
		el.classList.toggle('text-roll-loop--right', direction === 'right');
		el.style.setProperty('--text-roll-stagger', `${stagger}s`);
		el.style.setProperty('--text-roll-duration', `${duration}s`);

		let timer: ReturnType<typeof setTimeout>;
		const rollMs = (duration + stagger * spans.length) * 1000;

		const roll = () => {
			if (until?.()) return;
			el.classList.add('text-roll-loop--rolling');
			timer = setTimeout(() => {
				// The copy that rose in looks the same as the letter, and the transition lives on the rolling class, so this snaps back unseen.
				el.classList.remove('text-roll-loop--rolling');
				if (until?.()) return;
				void el.offsetWidth;
				timer = setTimeout(roll, Math.max(0, interval * 1000 - rollMs));
			}, rollMs);
		};
		timer = setTimeout(roll, delay * 1000);

		return () => {
			clearTimeout(timer);
			el.replaceChildren(...original);
			el.classList.remove('text-roll-loop--rolling', 'text-roll-loop--right');
			el.style.removeProperty('--text-roll-stagger');
			el.style.removeProperty('--text-roll-duration');
		};
	};
}
