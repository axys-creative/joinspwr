<script lang="ts">
	import Loader, { type LoaderOptions } from '$lib/components/loader.svelte';

	let { class: className, ...options }: LoaderOptions = $props();
</script>

<Loader {...options} exit={600} class="loader-bar {className ?? ''}">
	<div class="track" aria-hidden="true"><div class="fill"></div></div>
</Loader>

<style lang="scss">
	@use 'base/mixins';

	:global(.loader-bar) {
		place-items: center;
	}

	.track {
		width: min(320px, 60vw);
		height: 2px;
		background: var(--color-border);
	}

	.fill {
		height: 100%;
		background: var(--color-accent);
		transform: scaleX(var(--progress));
		transform-origin: left;
	}

	@include mixins.mq-motion-allow {
		:global(.loader-bar) {
			transition: opacity var(--exit) ease;
		}
	}

	:global(.loader-bar[data-phase='leaving']) {
		opacity: 0;
	}
</style>
