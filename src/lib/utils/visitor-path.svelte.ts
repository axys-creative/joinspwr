import { tick } from 'svelte';
import { goto } from '$app/navigation';
import { refreshScrollTriggers } from './gsap';

export type VisitorPath = 'new' | 'experienced';

const KEY = 'visitor-path';

let current = $state<VisitorPath>('experienced');

const isPath = (value: unknown): value is VisitorPath => value === 'new' || value === 'experienced';

export const visitorPath = {
	get current() {
		return current;
	},

	/** Reads the saved choice. Call it on mount, never during SSR. */
	restore() {
		try {
			const saved = sessionStorage.getItem(KEY);
			if (isPath(saved) && saved !== current) {
				current = saved;
				tick().then(refreshScrollTriggers);
			}
		} catch {
			// Storage can be blocked.
		}
	},

	/** Shows that path's sections on the home page, going there first when needed. */
	async choose(path: VisitorPath, { scrollTop = false } = {}) {
		const changed = path !== current;
		current = path;
		try {
			sessionStorage.setItem(KEY, path);
		} catch {
			// Storage can be blocked.
		}
		if (location.pathname !== '/') await goto('/');
		await tick();
		if (changed) refreshScrollTriggers();
		if (!scrollTop) return;
		// smooth-scroll.svelte answers this with Lenis; without it the browser scrolls itself.
		const event = new CustomEvent('scroll-top', { cancelable: true });
		if (document.dispatchEvent(event)) {
			const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
			scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
		}
	}
};
