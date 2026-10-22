<script module lang="ts">
	export type LoaderOptions = {
		/** Milliseconds the animation takes at the fastest, so a quick connection still plays it through. */
		minDuration?: number;
		/** Milliseconds after which it finishes even if the page is still loading. */
		maxDuration?: number;
		/** Reports the progress from 0 to 1 and returns a function that stops it. Defaults to watching the page's fonts and pictures. */
		track?: (update: (progress: number) => void) => () => void;
		/** Stays inside its parent and leaves the page alone: no scroll lock, and `loading.done` is untouched. */
		contained?: boolean;
		/** Runs when the loader has left. */
		onfinish?: () => void;
		class?: string;
	};

	export type LoaderProps = LoaderOptions & {
		/** Milliseconds the look takes to leave. It sets `--exit` on the element. */
		exit: number;
		/** The progress from 0 to 1, for a look that needs it outside its markup. `--progress` is also set on the element. */
		progress?: number;
		/** Draws the look. It gets the progress from 0 to 1. */
		children: Snippet<[number]>;
	};

	// The share of the exit that passes before the page behind is told to start.
	const RELEASE = 0.35;
	const HOLD = 150;
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { loading, trackLoad } from '$lib/utils/loading.svelte';
	import { onMount, untrack, type Snippet } from 'svelte';

	let {
		exit,
		progress = $bindable(0),
		minDuration = 900,
		maxDuration = 8000,
		track = trackLoad,
		contained = false,
		onfinish,
		class: className,
		children
	}: LoaderProps = $props();

	let phase = $state<'loading' | 'leaving' | 'gone'>('loading');
	let reduced = $state(false);
	const exitTime = $derived(reduced ? 0 : exit);

	// Runs while the layout renders, before the page behind it, so a hero is already waiting when it starts.
	if (browser && !untrack(() => contained)) {
		loading.done = false;
		document.documentElement.classList.add('loading');
	}

	const release = () => {
		if (contained) return;
		loading.done = true;
		document.documentElement.classList.remove('loading');
	};

	onMount(() => {
		reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const min = reduced ? 300 : Math.max(minDuration, 1);

		const timers: ReturnType<typeof setTimeout>[] = [];
		const start = performance.now();
		let real = 0;
		let last = start;
		let frame = 0;

		const stopTracking = track((progress) => (real = progress));

		const finish = () => {
			timers.push(
				setTimeout(() => {
					phase = 'leaving';
					timers.push(setTimeout(release, exitTime * RELEASE));
					timers.push(
						setTimeout(() => {
							phase = 'gone';
							onfinish?.();
						}, exitTime)
					);
				}, HOLD)
			);
		};

		const tick = (now: number) => {
			const elapsed = now - start;
			const target = elapsed >= maxDuration ? 1 : real;
			progress = Math.min(target, progress + (now - last) / min);
			last = now;

			if (progress >= 1) return finish();
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			stopTracking();
			timers.forEach(clearTimeout);
			release();
		};
	});
</script>

{#if phase !== 'gone'}
	<div
		class="loader {className ?? ''}"
		class:contained
		data-phase={phase}
		data-lenis-prevent
		role="status"
		aria-live="polite"
		aria-busy={phase === 'loading'}
		style="--progress: {progress}; --exit: {exitTime}ms"
	>
		<span class="visually-hidden">Loading</span>
		{@render children(progress)}
	</div>
{/if}

<style lang="scss">
	:global(html.loading) {
		overflow: hidden;
		scrollbar-gutter: stable;
	}

	.loader {
		position: fixed;
		inset: 0;
		z-index: var(--z-loading);
		display: grid;
		background: var(--color-bg);
		color: var(--color-text);
		// Hides it if the script never arrives.
		animation: loader-failsafe 0.3s ease 15s forwards;

		@media (scripting: none) {
			display: none;
		}

		&.contained {
			position: absolute;
			z-index: 2;
		}

		> :global(*) {
			grid-area: 1 / 1;
		}

		&[data-phase='leaving'] {
			pointer-events: none;
		}
	}

	@keyframes loader-failsafe {
		to {
			visibility: hidden;
			pointer-events: none;
		}
	}
</style>
