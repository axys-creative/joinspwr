<script module lang="ts">
	export type LogoTileProps = {
		src: string;
		alt?: string;
		/** The partner's website. With it, the whole tile is a link. */
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

	let { src, alt = '', url, newTab = false, match = false, dim = false }: LogoTileProps = $props();
</script>

<svelte:element
	this={url ? 'a' : 'div'}
	class="logo-tile"
	class:link={!!url}
	class:match
	class:dim
	href={url}
	target={url && newTab ? '_blank' : undefined}
	rel={url && newTab ? 'noopener noreferrer' : undefined}
	aria-label={url && alt ? `Visit ${alt}'s site` : undefined}
	{@attach gradientBorder({ rayTrace: 'border', rayReach: 300 })}
>
	<img {src} {alt} loading="lazy" />
</svelte:element>

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

		&.link {
			display: block;
			color: inherit;
			text-decoration: none;
			cursor: pointer;

			&:focus-visible,
			&:active {
				scale: 0.98;
			}

			@media (hover: hover) and (pointer: fine) {
				&:hover {
					scale: 0.98;
				}
			}
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
</style>
