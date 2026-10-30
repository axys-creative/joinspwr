<script module lang="ts">
	export type LogoTileProps = {
		src: string;
		alt?: string;
		/** The partner's website. With it, a "Visit site" link appears at the bottom left on hover or focus. */
		url?: string;
		/** Opens the link in a new tab. */
		newTab?: boolean;
		/** Lit as a search result: scaled up a little with an accent border. */
		match?: boolean;
		/** Faded because a search does not match it. */
		dim?: boolean;
	};
</script>

<script lang="ts">
	import { gradientBorder } from '$lib/attachments/gradient-border';
	import Button from './button.svelte';

	let { src, alt = '', url, newTab = false, match = false, dim = false }: LogoTileProps = $props();
</script>

<div
	class="logo-tile"
	class:match
	class:dim
	{@attach gradientBorder({ rayTrace: 'border', rayReach: 300 })}
>
	<img {src} {alt} loading="lazy" />
	{#if url}
		<div class="visit">
			<Button
				text="Visit site"
				textDescription={alt ? `Visit ${alt}'s site` : 'Visit site'}
				{url}
				{newTab}
				size="sm"
			/>
		</div>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.logo-tile {
		--gradient-ray-size: 180px;

		box-sizing: border-box;
		position: relative;
		aspect-ratio: var(--tile-ratio, 3 / 2);
		padding: var(--tile-padding, 24px);
		@include mixins.glass-card;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s var(--ease),
				scale 0.3s var(--ease),
				border-color 0.3s var(--ease);
		}

		// The ring sits on the card's own border, not just inside it.
		&:global(.gradient-border)::before {
			inset: -1px;
		}

		&.dim {
			opacity: 0.2;
		}

		&.match {
			border-color: var(--color-accent);
			scale: 1.04;
		}
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.visit {
		position: absolute;
		inset-block-end: 12px;
		inset-inline-start: 12px;
		z-index: 2;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s var(--ease),
				translate 0.3s var(--ease);
		}

		// Touch has no hover, so the button is always there.
		@media (hover: hover) and (pointer: fine) {
			opacity: 0;
			translate: 0 4px;
		}
	}

	@media (hover: hover) and (pointer: fine) {
		.logo-tile:hover .visit,
		.logo-tile:focus-within .visit {
			opacity: 1;
			translate: 0 0;
		}
	}
</style>
