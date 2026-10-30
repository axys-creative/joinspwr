import type { Attachment } from 'svelte/attachments';
import './roll.scss';

export type RollOptions = {
	/** What rolls: each `chars`, each `words`, the text as one `line`, or the `whole` target at once (an icon, or any markup). */
	split?: 'chars' | 'words' | 'line' | 'whole';
	/** Where the roll starts, for `chars` and `words`: the `start`, the `end`, the `center` (rolling outward), the `edges` (rolling inward) or at `random` (a new order every time). */
	from?: 'start' | 'end' | 'center' | 'edges' | 'random';
	/** The way the content leaves; the copy arrives from the other side. */
	direction?: 'up' | 'down' | 'left' | 'right';
	/** `false` never rolls back: each time the pointer or focus arrives it rolls on to the next copy, always the same way. */
	rewind?: boolean;
	/** Seconds between each piece starting to roll. */
	stagger?: number;
	/** Seconds each piece takes to roll. */
	duration?: number;
	/** The element that holds the content: a selector inside, or an element. Defaults to a `.label` (as in Button), else the element itself. */
	target?: string | HTMLElement;
};

/** Where in the order a piece rolls, for each of `count` pieces. */
function order(count: number, from: NonNullable<RollOptions['from']>) {
	const middle = (count - 1) / 2;
	const indexes = Array.from({ length: count }, (_, index) => {
		switch (from) {
			case 'end':
				return count - 1 - index;
			case 'center':
				return Math.abs(index - middle);
			case 'edges':
				return middle - Math.abs(index - middle);
			default:
				return index;
		}
	});
	if (from !== 'random') return indexes;
	for (let i = count - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[indexes[i], indexes[j]] = [indexes[j], indexes[i]];
	}
	return indexes;
}

/** Rolls a link, button or icon on hover or keyboard focus: the content leaves one side and a copy takes its place from the other. */
export function roll({
	split = 'chars',
	from = 'start',
	direction = 'up',
	rewind = true,
	stagger = 0.02,
	duration = 0.6,
	target: targetOption
}: RollOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const target =
			(typeof targetOption === 'string'
				? el.querySelector<HTMLElement>(targetOption)
				: targetOption) ??
			el.querySelector<HTMLElement>('.label') ??
			el;
		const original = Array.from(target.childNodes);

		let wrapper: HTMLElement;
		if (split === 'whole' || split === 'line') {
			const slide = document.createElement('span');
			slide.className = 'roll__slide';
			const front = document.createElement('span');
			front.className = 'roll__front';
			front.append(...original);
			const back = front.cloneNode(true) as HTMLElement;
			back.className = 'roll__back';
			back.setAttribute('aria-hidden', 'true');
			back.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
			back
				.querySelectorAll('a, button, input')
				.forEach((node) => node.setAttribute('tabindex', '-1'));
			slide.append(front, back);

			wrapper = document.createElement('span');
			wrapper.className = 'roll__whole';
			wrapper.append(slide);
			target.replaceChildren(wrapper);
		} else {
			const text = target.textContent ?? '';
			const tokens = split === 'words' ? text.split(/(\s+)/) : [...text];
			const pieces = split === 'words' ? tokens.filter((token) => token.trim()) : tokens;
			const delays = order(pieces.length, from);

			wrapper = document.createElement('span');
			wrapper.className = 'roll__chars';
			wrapper.setAttribute('aria-hidden', 'true');
			let piece = 0;
			for (const token of tokens) {
				const span = document.createElement('span');
				span.textContent = token;
				if (split === 'chars' || token.trim()) {
					span.className = 'roll__char';
					span.dataset.char = token;
					span.style.setProperty('--roll-index', String(delays[piece++] ?? 0));
					const cell = document.createElement('span');
					cell.className = 'roll__cell';
					cell.append(span);
					wrapper.append(cell);
				} else {
					span.className = 'roll__space';
					wrapper.append(span);
				}
			}

			const readable = document.createElement('span');
			readable.className = 'visually-hidden';
			readable.textContent = text;
			target.replaceChildren(readable, wrapper);
		}

		const modifiers = ['roll', `roll--${split}`, `roll--${direction}`];
		if (!rewind) modifiers.push('roll--forward');
		el.classList.add(...modifiers);
		el.style.setProperty('--roll-stagger', `${stagger}s`);
		el.style.setProperty('--roll-duration', `${duration}s`);

		// The copy is identical, so when a roll ends and the piece snaps back to rest nothing seems to change.
		const pieces = [...wrapper.querySelectorAll<HTMLElement>('.roll__char')];
		const reshuffle = () => {
			if (from !== 'random') return;
			order(pieces.length, from).forEach((delay, index) =>
				pieces[index].style.setProperty('--roll-index', String(delay))
			);
		};

		let running = false;
		const play = () => {
			if (running) return;
			running = true;
			const way = { up: '0% -100%', down: '0% 100%', left: '-100% 0%', right: '100% 0%' }[
				direction
			];
			const easing = getComputedStyle(el).getPropertyValue('--ease').trim() || 'ease';
			const animations = [
				...wrapper.querySelectorAll<HTMLElement>('.roll__char, .roll__slide')
			].map((node) =>
				node.animate([{ translate: '0% 0%' }, { translate: way }], {
					duration: duration * 1000,
					delay: Number(node.style.getPropertyValue('--roll-index') || 0) * stagger * 1000,
					easing,
					fill: 'backwards'
				})
			);
			Promise.allSettled(animations.map((animation) => animation.finished)).then(
				() => (running = false)
			);
		};
		const onEnter = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			reshuffle();
			if (!rewind) play();
		};
		const onFocus = () => {
			if (!el.matches(':focus-visible') && !el.querySelector(':focus-visible')) return;
			reshuffle();
			if (!rewind) play();
		};
		if (!rewind || from === 'random') {
			el.addEventListener('pointerenter', onEnter);
			el.addEventListener('focusin', onFocus);
		}

		return () => {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('focusin', onFocus);
			wrapper.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
			target.replaceChildren(...original);
			el.classList.remove(...modifiers);
			el.style.removeProperty('--roll-stagger');
			el.style.removeProperty('--roll-duration');
		};
	};
}
