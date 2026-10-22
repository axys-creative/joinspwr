<script lang="ts">
	import Loader, { type LoaderOptions } from '$lib/components/loader.svelte';
	import { onMount } from 'svelte';

	let { class: className, ...options }: LoaderOptions = $props();

	const EXIT = 1200;
	const FADE = 250;
	// The share of the grid's diagonals a tile may drift from its place in the wave, which is what scatters it.
	const SCATTER = 0.15;

	let progress = $state(0);
	let grid = $state<HTMLElement>();
	let cells = $state<{ cols: number; rows: number; delays: number[] }>({
		cols: 0,
		rows: 0,
		delays: []
	});

	// Each tile leaves after the ones nearer the top left, with some chance mixed in.
	onMount(() => {
		const build = () => {
			const { clientWidth: width, clientHeight: height } = grid!;
			const size = 64;
			const cols = Math.max(1, Math.round(width / size));
			const rows = Math.max(1, Math.round(height / size));
			if (cols === cells.cols && rows === cells.rows) return;

			const keys = Array.from({ length: cols * rows }, (_, index) => {
				const diagonal = (index % cols) + Math.floor(index / cols);
				return diagonal + Math.random() * SCATTER * (cols + rows);
			});
			const longest = Math.max(...keys);
			cells = {
				cols,
				rows,
				delays: keys.map((key) => (key / longest) * (EXIT - FADE))
			};
		};

		build();
		const observer = new ResizeObserver(build);
		observer.observe(grid!);
		return () => observer.disconnect();
	});
</script>

<Loader {...options} bind:progress exit={EXIT} class="loader-grid {className ?? ''}">
	<div
		bind:this={grid}
		class="grid"
		aria-hidden="true"
		style="--cols: {cells.cols}; --rows: {cells.rows}; --fade: {FADE}ms"
	>
		{#each cells.delays as delay, index (index)}
			<div class="tile" style="--delay: {delay}ms"></div>
		{/each}
	</div>

	<div class="count" aria-hidden="true">
		<span class="number">{Math.round(progress * 100)}<span class="percent">%</span></span>
	</div>
</Loader>

<style lang="scss">
	@use 'base/mixins';

	:global(.loader-grid) {
		place-items: end end;
	}

	.grid {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
		pointer-events: none;
	}

	.tile {
		background: var(--color-surface);
		// Covers the hairline seams between tiles that do not land on whole pixels.
		box-shadow: 0 0 0 0.5px var(--color-surface);
	}

	.count {
		position: relative;
		z-index: 1;
		padding: var(--body-padding);
	}

	.number {
		font-family: var(--font-heading);
		font-size: clamp(96px, 22vw, 280px);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.percent {
		margin-left: 0.05em;
		font-size: 0.4em;
		color: var(--color-text-muted);
	}

	@include mixins.mq-motion-allow {
		.tile {
			transition: opacity var(--fade) ease-in-out var(--delay);
		}

		.count {
			transition: opacity 0.3s ease;
		}
	}

	:global(.loader-grid[data-phase='leaving']) {
		background: none;

		.tile {
			opacity: 0;
		}

		.count {
			opacity: 0;
		}
	}
</style>
