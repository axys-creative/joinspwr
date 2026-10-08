<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { GnomonCutout } from '$lib/utils/gnomon';

	export type CardGnomonProps = {
		/** One entry per notch. Defaults to a single, unlabeled `top-right`. */
		cutouts?: GnomonCutout[];
		/** 0-100. How far every cutout reaches into the card, as a % of its side. */
		depth?: number;
		/** 0-100. How far every cutout runs along its edge, as a % of the card's side. */
		length?: number;
		/** 0-50. The corner curve as a % of the card's side, for every corner. */
		radius?: number;
		/** 45-90 degrees. 90 is a square step; lower tilts it toward a diagonal. */
		angle?: number;
		/** The stroke width in px. */
		borderWidth?: number;
		/** Any CSS background for the card behind the image, such as a color or gradient. Defaults to the surface color. */
		fill?: string;
		/** 1-100. When set, the image is this % of the card's width and height, centered and uncropped, instead of filling it. */
		imageSize?: number;
		img?: { src: string; alt?: string; eager?: boolean; sizes?: string };
		/** Anything else the card holds, on top of the image. */
		children?: Snippet;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { gnomonShape } from '$lib/utils/gnomon';

	let {
		cutouts = [{ from: 'top-right' }],
		depth = 12,
		length = 32,
		radius = 8,
		angle = 90,
		borderWidth = 2,
		fill,
		imageSize,
		img,
		children,
		class: className
	}: CardGnomonProps = $props();

	const id = $props.id();
	const shape = $derived(
		gnomonShape({
			cutouts: cutouts.length ? cutouts : [{ from: 'top-right' }],
			depth,
			length,
			radius,
			angle
		})
	);
</script>

<div
	class="card-gnomon {className ?? ''}"
	style="--border-width: {borderWidth}px{fill ? `; --fill: ${fill}` : ''}{imageSize
		? `; --image-size: ${imageSize}%`
		: ''}"
>
	<svg class="stroke" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
		<defs>
			<clipPath {id} clipPathUnits="objectBoundingBox"><path d={shape.clip} /></clipPath>
		</defs>
		<path d={shape.stroke} vector-effect="non-scaling-stroke" />
	</svg>

	<div class="inner" class:inset={!!imageSize} style="clip-path: url(#{id})">
		{#if img?.src}
			<img
				{...imageProps(img.src, { sizes: img.sizes ?? '(min-width: 768px) 400px, 80vw' })}
				alt={img.alt ?? ''}
				loading={img.eager ? 'eager' : 'lazy'}
			/>
		{/if}
		{#if children}<div class="body">{@render children()}</div>{/if}
	</div>

	{#each shape.labels as label (label.from)}
		<span class="label" style={label.style}>{label.text}</span>
	{/each}
</div>

<style lang="scss">
	@use 'base/mixins';

	.card-gnomon {
		--border-color: var(--color-border);
		--border-width: 2px;
		--fill: var(--color-surface);

		position: relative;
		display: inline-block;
		width: var(--card-size, 25vw);
		aspect-ratio: 1;

		@include mixins.max-md {
			width: var(--card-size, 50vw);
		}

		&:hover {
			--border-color: var(--color-accent);
		}
	}

	// The stroke is centered on the viewBox edge, so it must overflow or the outer edges and corners get cropped.
	.stroke {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;

		path {
			fill: none;
			stroke: var(--border-color);
			stroke-width: var(--border-width);

			@include mixins.mq-motion-allow {
				transition: stroke 0.3s ease;
			}
		}
	}

	// Same box and shape as the stroke, so the content's edge sits exactly on the line.
	.inner {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: var(--fill);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.inset {
		display: grid;
		place-items: center;

		img {
			width: var(--image-size);
			height: var(--image-size);
			object-fit: contain;
		}
	}

	.body {
		position: absolute;
		inset: 0;
		padding: 16px;
		pointer-events: none;
	}

	.label {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		font-size: 14px;
		line-height: 1.2;
		text-align: center;
		pointer-events: none;

		@include mixins.max-xxl {
			font-size: 12px;
		}
	}
</style>
