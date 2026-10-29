<script lang="ts">
	import 'lenis/dist/lenis.css';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import type Lenis from 'lenis';
	import { whenScrollTrigger } from '$lib/utils/gsap';

	let lenis: Lenis | undefined;

	// Lenis keeps its own scroll target and would glide back to the old position after SvelteKit resets it.
	afterNavigate(({ type, to }) => {
		if (!lenis || to?.url.hash) return;
		lenis.scrollTo(type === 'popstate' ? window.scrollY : 0, { immediate: true, force: true });
	});

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let destroyed = false;
		let stopSync: (() => void) | undefined;

		import('lenis').then(({ default: LenisClass }) => {
			if (destroyed) return;
			lenis = new LenisClass({ autoRaf: true, lerp: 0.06, anchors: true });

			// Pins would otherwise read the scroll a frame after Lenis moves it, and jump.
			whenScrollTrigger().then((ScrollTrigger) => {
				if (!destroyed) stopSync = lenis?.on('scroll', ScrollTrigger.update);
			});
		});

		// Lenis ignores a bare "#" link, so route it to the top.
		const onClick = (event: MouseEvent) => {
			if (!lenis || !(event.target as Element).closest('a[href="#"]')) return;
			event.preventDefault();
			lenis.scrollTo(0);
		};
		const onScrollTop = (event: Event) => {
			if (!lenis) return;
			event.preventDefault();
			lenis.scrollTo(0, { duration: 0.8 });
		};
		const onScrollTo = (event: Event) => {
			if (!lenis) return;
			event.preventDefault();
			lenis.scrollTo((event as CustomEvent<{ top: number }>).detail.top, { duration: 1 });
		};
		document.addEventListener('click', onClick);
		document.addEventListener('scroll-top', onScrollTop);
		document.addEventListener('scroll-to', onScrollTo);

		return () => {
			destroyed = true;
			stopSync?.();
			document.removeEventListener('click', onClick);
			document.removeEventListener('scroll-top', onScrollTop);
			document.removeEventListener('scroll-to', onScrollTo);
			lenis?.destroy();
		};
	});
</script>
