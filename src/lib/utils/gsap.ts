import type { gsap as Gsap } from 'gsap';

type PluginName = 'scramble' | 'scrollTrigger' | 'splitText';

const loaders: Record<PluginName, () => Promise<object>> = {
	scramble: () => import('gsap/ScrambleTextPlugin').then((module) => module.ScrambleTextPlugin),
	scrollTrigger: () =>
		import('gsap/ScrollTrigger').then((module) => {
			// Any `refreshPriority` makes every refresh sort triggers by where their element is on the page. Without
			// it they refresh in the order they were made, and a trigger made before the pinned section above it
			// measures itself without that section's spacer.
			module.ScrollTrigger.defaults({ refreshPriority: 0 });
			return module.ScrollTrigger;
		}),
	splitText: () => import('gsap/SplitText').then((module) => module.SplitText)
};

let core: Promise<typeof Gsap> | undefined;
const registering = new Map<PluginName, Promise<void>>();

let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let lastScroll = 0;
let listening = false;
let urgent = false;
const SCROLL_IDLE = 300;

let resolveReady: () => void;
const scrollTriggerReady = new Promise<void>((resolve) => (resolveReady = resolve));

/** Resolves with ScrollTrigger once some section has loaded it; never loads it itself. */
export const whenScrollTrigger = () =>
	scrollTriggerReady.then(() =>
		import('gsap/ScrollTrigger').then((module) => module.ScrollTrigger)
	);

/**
 * Measures every ScrollTrigger again, in page order, once things have gone quiet. Sections build their triggers
 * whenever their own imports finish, which is not page order, so this puts pins and the triggers below them right.
 * `loadGsap('scrollTrigger')` asks for it already; call it again after anything slower than that. `immediate` skips
 * the wait for scrolling to stop, for changes that move whole sections, since pins are wrong until the refresh.
 */
export function refreshScrollTriggers({ immediate = false } = {}) {
	if (!listening) {
		listening = true;
		addEventListener('scroll', () => (lastScroll = performance.now()), { passive: true });
	}
	urgent ||= immediate;
	clearTimeout(refreshTimer);
	refreshTimer = setTimeout(async function run() {
		// A refresh in the middle of a scroll resets what the sections are chasing, such as the tunnel's trailing slides.
		if (!urgent && performance.now() - lastScroll < SCROLL_IDLE) {
			refreshTimer = setTimeout(run, SCROLL_IDLE);
			return;
		}
		urgent = false;
		const { ScrollTrigger } = await import('gsap/ScrollTrigger');
		ScrollTrigger.refresh();
	}, 200);
}

/**
 * Loads GSAP and any plugins you name, once. Pages that never call this never download GSAP, so
 * call it from an attachment (not at module scope) and keep plugin lists as short as possible.
 */
export async function loadGsap(...plugins: PluginName[]) {
	core ??= import('gsap').then((module) => module.gsap);
	const gsap = await core;
	if (plugins.includes('scrollTrigger')) refreshScrollTriggers();

	await Promise.all(
		plugins.map((name) => {
			let pending = registering.get(name);
			if (!pending) {
				pending = loaders[name]().then((plugin) => gsap.registerPlugin(plugin));
				registering.set(name, pending);
			}
			return pending;
		})
	);
	if (plugins.includes('scrollTrigger')) resolveReady();
	return gsap;
}
