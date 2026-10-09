<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ToolSlide = {
		image: { src: string; alt?: string };
		/** The tool's name. Captions the large panel and names the side panels for screen readers. */
		title?: string;
	};

	export type ToolsProps = Pick<SectionCopyProps, 'eyebrowText' | 'eyebrowIcon' | 'title'> & {
		/** At least three. The active one fills the large middle panel, and its neighbours sit thin and short on either side. */
		slides: ToolSlide[];
		/** The accessible name of the carousel. */
		label?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	const SWIPE_DISTANCE = 50;

	let {
		slides,
		label = 'Tools',
		fullScreen = false,
		id,
		class: className,
		title,
		eyebrowText,
		eyebrowIcon
	}: ToolsProps = $props();

	let index = $state(0);
	let startX = 0;
	let swiped = false;

	const count = $derived(slides.length);
	// The shortest way round, so the slide after the last is the first.
	const offsetOf = (at: number) => {
		const half = Math.floor(count / 2);
		return ((at - index + count + half) % count) - half;
	};

	const go = (step: number) => {
		index = (index + step + count) % count;
	};

	const onpointerdown = (event: PointerEvent) => {
		startX = event.clientX;
		swiped = false;
	};
	const onpointerup = (event: PointerEvent) => {
		const distance = event.clientX - startX;
		if (Math.abs(distance) < SWIPE_DISTANCE) return;
		swiped = true;
		go(distance < 0 ? 1 : -1);
	};
</script>

<section
	{id}
	class="tools {className ?? ''}"
	class:full-screen={fullScreen}
	aria-label={label}
	aria-roledescription="carousel"
>
	<div class="inner">
		<div class="copy">
			<SectionCopy
				level={2}
				align="center"
				{eyebrowText}
				{eyebrowIcon}
				{title}
				showDescription={false}
				showCta={false}
			/>
		</div>

		<!-- Swiping is an extra; the arrows and the side panels, which are buttons, work from the keyboard. -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="stage" {onpointerdown} {onpointerup}>
			{#each slides as slide, i (i)}
				{@const offset = offsetOf(i)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<svelte:element
					this={offset === 0 ? 'figure' : 'button'}
					class="panel"
					data-offset={Math.max(-2, Math.min(2, offset))}
					type={offset === 0 ? undefined : 'button'}
					aria-label={offset === 0 ? undefined : `Show ${slide.title ?? `slide ${i + 1}`}`}
					inert={Math.abs(offset) > 1}
					onclick={offset === 0
						? undefined
						: () => {
								if (!swiped) index = i;
							}}
				>
					<img
						{...imageProps(slide.image.src, { sizes: '(min-width: 768px) 800px, 90vw' })}
						alt={offset === 0 ? (slide.image.alt ?? '') : ''}
						loading={Math.abs(offset) > 1 ? 'lazy' : 'eager'}
						draggable="false"
					/>
					{#if slide.title}<span class="caption" aria-hidden={offset !== 0}>{slide.title}</span
						>{/if}
				</svelte:element>
			{/each}
		</div>

		{#if count > 1}
			<div class="controls">
				<Button
					class="prev"
					iconStart="chevron-right"
					textDescription="Previous slide"
					onclick={() => go(-1)}
				/>
				<Button iconStart="chevron-right" textDescription="Next slide" onclick={() => go(1)} />
			</div>
		{/if}

		<p class="visually-hidden" aria-live="polite">
			{slides[index]?.title ?? ''}, {index + 1} of {count}
		</p>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 48px;
		padding-block: var(--body-padding-double);
	}

	.copy {
		display: flex;
		justify-content: center;
		max-width: var(--content-width);
		padding-inline: var(--body-padding);
	}

	// Three slots across the content width: a thin one, a wide one, a thin one. Every panel sits in one of them (or waits
	// hidden beside it) and glides there when the active slide changes.
	.stage {
		--side: 17%;
		--center: 62%;
		--gap: 2%;
		--side-height: 78%;

		position: relative;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		aspect-ratio: 2.9;
		touch-action: pan-y;
		user-select: none;

		@include mixins.max-md {
			--side: 8%;
			--center: 80%;
			--gap: 2%;
			--side-height: 84%;

			aspect-ratio: 1.15;
		}
	}

	.panel {
		position: absolute;
		top: calc((100% - var(--side-height)) / 2);
		display: block;
		width: var(--side);
		height: var(--side-height);
		margin: 0;
		padding: 0;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);
		color: inherit;
		isolation: isolate;

		@include mixins.mq-motion-allow {
			transition:
				left 0.8s var(--ease),
				top 0.8s var(--ease),
				width 0.8s var(--ease),
				height 0.8s var(--ease),
				opacity 0.8s var(--ease);
		}

		&[data-offset='-1'],
		&[data-offset='-2'] {
			left: 0;
		}

		&[data-offset='0'] {
			top: 0;
			left: calc(var(--side) + var(--gap));
			width: var(--center);
			height: 100%;
		}

		&[data-offset='1'],
		&[data-offset='2'] {
			left: calc(var(--side) + var(--gap) + var(--center) + var(--gap));
		}

		&[data-offset='-2'],
		&[data-offset='2'] {
			opacity: 0;
			pointer-events: none;
		}

		// A dim veil on the sides, so the middle one leads.
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: rgb(0 0 0 / 0.5);
			pointer-events: none;

			@include mixins.mq-motion-allow {
				transition: opacity 0.8s var(--ease);
			}
		}

		&[data-offset='0']::after {
			opacity: 0;
		}
	}

	button.panel {
		cursor: pointer;

		@include mixins.desktop-hover {
			&::after {
				opacity: 0.25;
			}
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 2px;
		}
	}

	img {
		position: absolute;
		inset: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.caption {
		position: absolute;
		right: 0;
		bottom: 0;
		left: 0;
		padding: 48px 24px 20px;
		background: linear-gradient(to top, rgb(0 0 0 / 0.65), transparent);
		color: #fff;
		font-family: var(--font-heading);
		font-size: clamp(16px, 2vw, 24px);
		line-height: 1;
		opacity: 0;
		pointer-events: none;

		@include mixins.mq-motion-allow {
			transition: opacity 0.6s var(--ease);
		}
	}

	[data-offset='0'] .caption {
		opacity: 1;
	}

	.controls {
		display: flex;
		gap: 12px;

		:global(.prev .icon) {
			rotate: 180deg;
		}
	}
</style>
