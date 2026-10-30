<script module lang="ts">
	export type LogoSearchProps = {
		/** The names to search, in the same order as the logos. */
		names: string[];
		/** The grid of logos the box follows: it shows from when the grid's top reaches 50% down the screen until its bottom reaches 75%. */
		grid?: HTMLElement;
		/** From `lg` up, the box centers on this element's column instead of the screen, such as the pinned copy. */
		alignTo?: HTMLElement;
		/** A short heading above the field, such as "Find your dealer". */
		title?: string;
		/** Accessible name and placeholder of the field, such as "Search finance options". */
		label?: string;
		/** The indexes of the names that match, or `null` while the field is empty. */
		matches?: Set<number> | null;
	};
</script>

<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { gradientBorder } from '$lib/attachments/gradient-border';
	import type { TransitionConfig } from 'svelte/transition';
	import { searchNames } from '$lib/utils/logo-search';
	import { searchQueue } from '$lib/utils/logo-search-queue.svelte';
	import Button from './button.svelte';

	let {
		names,
		grid,
		alignTo,
		title,
		label = 'Search',
		matches = $bindable(null)
	}: LogoSearchProps = $props();

	const id = $props.id();

	let query = $state('');
	let inView = $state(false);
	let dismissed = $state(false);

	const visible = $derived(inView && !dismissed && searchQueue.active === id);

	// backOut with a gentler overshoot (Svelte's is 1.70158).
	const softBackOut = (t: number) => {
		const x = t - 1;
		return x * x * (2 * x + 1) + 1;
	};

	const duration = (ms: number) =>
		matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;

	// Slides up from the bottom edge; a search that replaces another waits a beat.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function arrive(_node?: Element): TransitionConfig {
		const { handoff } = searchQueue;
		return {
			delay: duration(handoff ? 120 : 0),
			duration: duration(handoff ? 850 : 750),
			easing: softBackOut,
			css: (t, u) => `transform: translateY(${u * 72}px); opacity: ${Math.min(1, t)}`
		};
	}

	// The arrival in reverse: back down the way it came.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function leave(_node?: Element): TransitionConfig {
		return {
			duration: duration(600),
			easing: cubicInOut,
			css: (t, u) => `transform: translateY(${u * 72}px); opacity: ${t}`
		};
	}

	$effect(() => {
		matches = searchNames(names, query);
	});

	$effect(() => {
		if (!grid) return;

		let frame = 0;

		const update = () => {
			frame = 0;
			const rect = grid.getBoundingClientRect();
			const next = rect.top <= innerHeight * 0.5 && rect.bottom > innerHeight * 0.75;
			if (next === inView) return;
			inView = next;
			if (inView) searchQueue.enter(id);
			else {
				searchQueue.leave(id);
				dismissed = false;
			}
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		update();
		addEventListener('scroll', schedule, { passive: true });
		addEventListener('resize', schedule);
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
			searchQueue.leave(id);
		};
	});

	// With exactly one match, scrolls to it, once per match, after a pause so a keystroke can still change it.
	let scrolledTo = -1;

	$effect(() => {
		if (matches?.size !== 1) {
			scrolledTo = -1;
			return;
		}

		const [index] = matches;
		if (index === scrolledTo) return;
		const timeout = setTimeout(() => {
			scrolledTo = index;
			scrollToLogo(index);
		}, 100);
		return () => clearTimeout(timeout);
	});

	// Leaves a logo that is already in clear view alone. Otherwise it lands near the middle, but low enough that the grid's
	// bottom stays above the point where this box leaves, or the dimming would vanish mid-search.
	function scrollToLogo(index: number) {
		const logo = grid?.children[index];
		if (!grid || !logo) return;

		const view = innerHeight;
		const rect = logo.getBoundingClientRect();
		if (rect.top > view * 0.1 && rect.bottom < view * 0.75) return;

		const middle = rect.top + rect.height / 2;
		const toGridBottom = grid.getBoundingClientRect().bottom - middle;
		const at = Math.min(view * 0.6, Math.max(view * 0.5, view * 0.79 - toGridBottom));
		const top = scrollY + middle - at;

		// smooth-scroll.svelte answers this with Lenis; without it the browser scrolls itself.
		const event = new CustomEvent('scroll-to', { cancelable: true, detail: { top } });
		if (document.dispatchEvent(event)) {
			const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
			scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
		}
	}

	let column = $state<{ center: number; width: number } | null>(null);

	$effect(() => {
		if (!alignTo) return;
		const element = alignTo;
		const wide = matchMedia('(min-width: 1024px)');
		const measure = () => {
			const rect = element.getBoundingClientRect();
			column = wide.matches ? { center: rect.left + rect.width / 2, width: rect.width } : null;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		wide.addEventListener('change', measure);
		addEventListener('resize', measure);
		return () => {
			observer.disconnect();
			wide.removeEventListener('change', measure);
			removeEventListener('resize', measure);
		};
	});

	$effect(() => {
		if (!visible) query = '';
	});
</script>

{#if visible}
	<div
		class="logo-search"
		role="search"
		style:left={column ? `${column.center}px` : undefined}
		style:width={column ? `min(640px, ${column.width}px)` : undefined}
		aria-labelledby={title ? `${id}-title` : undefined}
		in:arrive
		out:leave
	>
		{#if title}
			<strong id="{id}-title" class="title">{title}</strong>
		{/if}
		<Button
			class="close"
			iconStart="x-lg"
			textDescription="Close search"
			type="outline"
			size="sm"
			onclick={() => (dismissed = true)}
		/>
		<div class="field" {@attach gradientBorder({ rayTrace: 'border' })}>
			<input
				type="search"
				aria-label={label}
				placeholder={label}
				autocomplete="off"
				spellcheck="false"
				bind:value={query}
				onkeydown={(event) => event.key === 'Escape' && (query = '')}
			/>
			<span class="status" role="status">
				{#if matches}{matches.size ? `${matches.size} found` : 'No match'}{/if}
			</span>
		</div>
	</div>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.logo-search {
		position: fixed;
		bottom: 16px;
		left: 50%;
		z-index: var(--z-alert);
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 12px;
		box-sizing: border-box;
		width: min(640px, calc(100% - 32px));
		padding: 16px;
		translate: -50% 0;
		border-radius: var(--radius);
		background: var(--color-surface);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
	}

	.title {
		@include mixins.h5;
	}

	.field {
		position: relative;
		grid-column: 1 / -1;
		border-radius: var(--radius);
	}

	input {
		box-sizing: border-box;
		width: 100%;
		padding: 12px 96px 12px 16px;
		border: 1px solid color-mix(in srgb, var(--color-text) 45%, transparent);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--color-text) 6%, transparent);
		color: var(--color-text);
		font: inherit;

		@include mixins.mq-motion-allow {
			transition: border-color 0.25s ease;
		}

		&::placeholder {
			color: var(--color-text);
			opacity: 0.6;
		}

		&:hover {
			border-color: var(--color-text);
		}

		&:focus-visible {
			border-color: var(--color-accent);
			outline: none;
		}
	}

	.status {
		position: absolute;
		top: 50%;
		right: 16px;
		translate: 0 -50%;
		font-size: 14px;
		opacity: 0.7;
		pointer-events: none;
		white-space: nowrap;
	}
</style>
