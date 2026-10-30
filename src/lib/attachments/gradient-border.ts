import type { Attachment } from 'svelte/attachments';
import { hasMouse, pointer, trackPointer } from '$lib/utils/pointer';
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

type Tracked = {
	el: HTMLElement;
	reach?: number;
	/** `rayTrace: true`: a glow that reacts from anywhere, not a border ring that reacts only near the pointer. */
	glow: boolean;
	box?: DOMRect;
	lit: boolean;
};

// A ring ignores a pointer farther than its reach (the default ray size) plus a margin for boxes that moved since they were measured.
const RANGE = 160;
const MARGIN = 80;

const tracked = new Map<Element, Tracked>();
const visible = new Set<Tracked>();
let observer: IntersectionObserver | undefined;
let stopPointer: (() => void) | undefined;
let frame = 0;
let stale = true;

const markStale = () => (stale = true);

const gap = (box: DOMRect) =>
	Math.hypot(
		Math.max(box.left - pointer.x, 0, pointer.x - box.right),
		Math.max(box.top - pointer.y, 0, pointer.y - box.bottom)
	);

const percent = (value: number, size: number) => `${(value / size) * 100}%`;

function update() {
	frame = 0;

	// Boxes are measured again only after a scroll or resize, so a pointer move reads layout only for the elements it is near.
	if (stale) {
		for (const item of visible) item.box = item.el.getBoundingClientRect();
		stale = false;
	}

	// Every read comes before any write, so the few elements near the pointer cost one layout, not one each.
	const writes: [HTMLElement, string, string][] = [];
	const maxDistance = Math.hypot(innerWidth, innerHeight);

	for (const item of visible) {
		const { el, reach, glow } = item;
		const limit = reach ?? RANGE;

		// Out of range: switched off once, then left alone.
		const off = () => {
			if (!item.lit) return;
			item.lit = false;
			writes.push([el, '--gradient-ray-opacity', '0']);
		};

		if (!glow && item.box && gap(item.box) > limit + MARGIN) {
			off();
			continue;
		}

		const rect = el.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		if (glow) {
			const intensity =
				1 - Math.min(Math.hypot(pointer.x - centerX, pointer.y - centerY) / maxDistance, 1);
			writes.push(
				[el, '--gradient-x', percent(pointer.x - rect.left, rect.width)],
				[el, '--gradient-y', percent(pointer.y - rect.top, rect.height)],
				[el, '--gradient-opacity', String(0.3 + intensity * 0.7)]
			);
			continue;
		}

		const outside = gap(rect);
		if (outside > limit) {
			off();
			continue;
		}
		let x = pointer.x;
		let y = pointer.y;
		// With a `reach` the spot rests on the border in the pointer's direction; without one the glow follows the pointer itself, so it fades in as the pointer closes in.
		if (outside > 0 && reach) {
			const length = Math.hypot(pointer.x - centerX, pointer.y - centerY);
			const radius = Math.min(rect.width, rect.height) / 2;
			x = centerX + ((pointer.x - centerX) / length) * radius;
			y = centerY + ((pointer.y - centerY) / length) * radius;
		}
		item.lit = true;
		writes.push(
			[el, '--gradient-x', percent(x - rect.left, rect.width)],
			[el, '--gradient-y', percent(y - rect.top, rect.height)],
			[el, '--gradient-ray-opacity', String(reach ? Math.max(1 - outside / reach, 0) : 1)]
		);
	}

	for (const [el, name, value] of writes) el.style.setProperty(name, value);
}

const onMove = () => (frame ||= requestAnimationFrame(update));

// A ring left lit when the mouse leaves the window would stay lit.
const onLeave = () => {
	for (const item of tracked.values()) {
		if (!item.lit) continue;
		item.lit = false;
		item.el.style.setProperty('--gradient-ray-opacity', '0');
	}
};

// Only the elements on (or just off) the screen are looked at, so a page full of tiles costs what the visible ones do.
function start() {
	stopPointer = trackPointer(onMove);
	addEventListener('scroll', markStale, { passive: true, capture: true });
	addEventListener('resize', markStale, { passive: true });
	document.documentElement.addEventListener('mouseleave', onLeave);
	observer = new IntersectionObserver(
		(entries) => {
			for (const { target, isIntersecting } of entries) {
				const item = tracked.get(target);
				if (!item) continue;
				if (isIntersecting) visible.add(item);
				else visible.delete(item);
			}
			stale = true;
		},
		{ rootMargin: '200px' }
	);
}

function stop() {
	stopPointer?.();
	removeEventListener('scroll', markStale, { capture: true });
	removeEventListener('resize', markStale);
	document.documentElement.removeEventListener('mouseleave', onLeave);
	cancelAnimationFrame(frame);
	frame = 0;
	observer?.disconnect();
	observer = undefined;
}

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

		const entry: Tracked = {
			el,
			reach: rayTrace === 'border' ? rayReach : undefined,
			glow: rayTrace === true,
			lit: false
		};
		// The border ring shows only with a mouse and motion allowed, so otherwise it is never tracked.
		const live =
			rayTrace === true ||
			(rayTrace === 'border' &&
				hasMouse() &&
				matchMedia('(prefers-reduced-motion: no-preference)').matches);
		if (live) {
			if (!tracked.size) start();
			tracked.set(el, entry);
			observer?.observe(el);
		}

		return () => {
			if (tracked.delete(el)) {
				visible.delete(entry);
				observer?.unobserve(el);
				if (!tracked.size) stop();
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
