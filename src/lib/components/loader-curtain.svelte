<script lang="ts">
	import Loader, { type LoaderOptions } from '$lib/components/loader.svelte';

	let { class: className, ...options }: LoaderOptions = $props();
</script>

<Loader {...options} exit={1000} class="loader-curtain {className ?? ''}">
	{#snippet children(progress)}
		<div class="panel top"></div>
		<div class="panel bottom"></div>
		<span class="number" aria-hidden="true"
			>{Math.round(progress * 100)}<span class="percent">%</span></span
		>
	{/snippet}
</Loader>

<style lang="scss">
	@use 'base/mixins';

	:global(.loader-curtain) {
		place-items: center;
		background: none;
	}

	.panel {
		width: 100%;
		height: 50%;
		background: var(--color-bg);
	}

	.top {
		align-self: start;
	}

	.bottom {
		align-self: end;
	}

	.number {
		position: relative;
		font-family: var(--font-heading);
		font-size: clamp(64px, 12vw, 140px);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.percent {
		margin-left: 0.05em;
		font-size: 0.4em;
		color: var(--color-text-muted);
	}

	@include mixins.mq-motion-allow {
		.panel {
			transition: translate var(--exit) var(--ease);
		}

		.number {
			transition: opacity calc(var(--exit) * 0.4) ease;
		}
	}

	:global(.loader-curtain[data-phase='leaving']) {
		.top {
			translate: 0 -100%;
		}

		.bottom {
			translate: 0 100%;
		}

		.number {
			opacity: 0;
		}
	}
</style>
