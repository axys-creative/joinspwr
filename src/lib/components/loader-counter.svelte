<script lang="ts">
	import Loader, { type LoaderOptions } from '$lib/components/loader.svelte';

	let { class: className, ...options }: LoaderOptions = $props();
</script>

<Loader {...options} exit={900} class="loader-counter {className ?? ''}">
	{#snippet children(progress)}
		<span class="number" aria-hidden="true"
			>{Math.round(progress * 100)}<span class="percent">%</span></span
		>
	{/snippet}
</Loader>

<style lang="scss">
	@use 'base/mixins';

	:global(.loader-counter) {
		place-items: end start;
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
		:global(.loader-counter) {
			transition: translate var(--exit) var(--ease);
		}
	}

	:global(.loader-counter[data-phase='leaving']) {
		translate: 0 -100%;
	}
</style>
