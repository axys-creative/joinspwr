import type { Attachment } from 'svelte/attachments';
import './gradient-border.scss';

export type GradientBorderOptions = {
	/** Border width in px. */
	width?: number;
	/** Gradient angle in degrees. */
	angle?: number;
	/** Any CSS color. */
	color?: string;
	/** How much of the border the gradient covers. */
	length?: 'short' | 'long';
	/** `true` sweeps around the element forever; `'hover'` reveals it on hover. */
	animate?: boolean | 'hover';
	/** Seconds per sweep. */
	duration?: number;
	/** A glow that follows the pointer. Give the element its own background. `'border'` lights only the border ring near the pointer, so it works over glass. */
	rayTrace?: boolean | 'border';
	/** With `rayTrace: 'border'`, how far in px the pointer can be from the element and still light it. The glow then stays on the nearest part of the border, sized by `--gradient-ray-size`, and fades with distance. */
	rayReach?: number;
};

type Tracked = { el: HTMLElement; reach?: number };

const tracked = new Map<Element, Tracked>();
const visible = new Set<Tracked>();
let observer: IntersectionObserver | undefined;
let pointerX = 0;
let pointerY = 0;
let frame = 0;
let maxDistance = 0;

function updateRayTrace() {
	frame = 0;

	// Every measurement comes before any write, so many tracked elements cost one layout, not one each.
	const writes: [HTMLElement, string, string][] = [];

	for (const { el, reach } of visible) {
		const rect = el.getBoundingClientRect();

		if (reach) {
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const outside = Math.hypot(
				Math.max(Math.abs(pointerX - centerX) - rect.width / 2, 0),
				Math.max(Math.abs(pointerY - centerY) - rect.height / 2, 0)
			);
			let x = pointerX;
			let y = pointerY;
			if (outside > 0) {
				const length = Math.hypot(pointerX - centerX, pointerY - centerY);
				const radius = Math.min(rect.width, rect.height) / 2;
				x = centerX + ((pointerX - centerX) / length) * radius;
				y = centerY + ((pointerY - centerY) / length) * radius;
			}
			writes.push(
				[el, '--gradient-x', `${((x - rect.left) / rect.width) * 100}%`],
				[el, '--gradient-y', `${((y - rect.top) / rect.height) * 100}%`],
				[el, '--gradient-ray-opacity', String(Math.max(1 - outside / reach, 0))]
			);
			continue;
		}

		const distance = Math.hypot(
			pointerX - (rect.left + rect.width / 2),
			pointerY - (rect.top + rect.height / 2)
		);
		const intensity = 1 - Math.min(distance / maxDistance, 1);

		writes.push(
			[el, '--gradient-x', `${((pointerX - rect.left) / rect.width) * 100}%`],
			[el, '--gradient-y', `${((pointerY - rect.top) / rect.height) * 100}%`],
			[el, '--gradient-opacity', String(0.3 + intensity * 0.7)]
		);
	}

	for (const [el, name, value] of writes) el.style.setProperty(name, value);
}

const onPointerMove = (event: PointerEvent) => {
	if (event.pointerType === 'touch') return;
	pointerX = event.clientX;
	pointerY = event.clientY;
	if (!frame) frame = requestAnimationFrame(updateRayTrace);
};

// Only the elements on (or just off) the screen are measured, so a page full of tiles costs what the visible ones do.
const watch = (entry: Tracked) => {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const { target, isIntersecting } of entries) {
				const item = tracked.get(target);
				if (!item) continue;
				if (isIntersecting) visible.add(item);
				else visible.delete(item);
			}
		},
		{ rootMargin: '200px' }
	);
	observer.observe(entry.el);
};

const onResize = () => (maxDistance = Math.hypot(innerWidth, innerHeight));

export function gradientBorder({
	width,
	angle,
	color,
	length,
	animate,
	duration,
	rayTrace,
	rayReach
}: GradientBorderOptions = {}): Attachment<HTMLElement> {
	return (el) => {
		const classes = [
			'gradient-border',
			length && `gradient-border--${length}`,
			animate === 'hover' && 'gradient-border--animate-hover',
			animate === true && 'gradient-border--animate',
			rayTrace === 'border' && 'gradient-border--ray-border',
			rayTrace === true && 'gradient-border--ray-trace'
		].filter((name): name is string => !!name);
		el.classList.add(...classes);

		const vars: Record<string, string | undefined> = {
			'--gradient-border-width': width === undefined ? undefined : `${width}px`,
			'--gradient-border-angle': angle === undefined ? undefined : `${angle}deg`,
			'--gradient-border-color': color,
			'--gradient-border-duration': duration === undefined ? undefined : `${duration}s`
		};
		for (const [name, value] of Object.entries(vars)) {
			if (value) el.style.setProperty(name, value);
		}

		const entry: Tracked = { el, reach: rayTrace === 'border' ? rayReach : undefined };
		// The border ring shows only with a mouse and motion allowed, so otherwise it is never tracked.
		const live =
			rayTrace === true ||
			(rayTrace === 'border' &&
				matchMedia('(hover: hover) and (pointer: fine)').matches &&
				matchMedia('(prefers-reduced-motion: no-preference)').matches);
		if (live) {
			if (!tracked.size) {
				onResize();
				addEventListener('pointermove', onPointerMove, { passive: true });
				addEventListener('resize', onResize, { passive: true });
			}
			tracked.set(el, entry);
			watch(entry);
		}

		return () => {
			if (tracked.delete(el)) {
				visible.delete(entry);
				observer?.unobserve(el);
				if (!tracked.size) {
					removeEventListener('pointermove', onPointerMove);
					removeEventListener('resize', onResize);
					cancelAnimationFrame(frame);
					frame = 0;
					observer?.disconnect();
					observer = undefined;
				}
			}
			el.classList.remove(...classes);
			for (const name of [
				...Object.keys(vars),
				'--gradient-x',
				'--gradient-y',
				'--gradient-opacity',
				'--gradient-ray-opacity'
			]) {
				el.style.removeProperty(name);
			}
		};
	};
}
