<script module lang="ts">
	import type { LogoProps } from '$lib/components/logo.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CircleHighlightSlice = { title: string; description?: string };

	export type CircleHighlightProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'title' | 'description'
	> & {
		/** One slice of the ring each, highlighted in turn clockwise as the page scrolls. */
		slices: CircleHighlightSlice[];
		/** 0-99, the hole as a percent of the ring's radius. A bigger hole is a thinner ring, and `0` draws solid pie slices. */
		holeSize?: number;
		/** The curve on every slice corner, in the ring's own 0-100 units. */
		radius?: number;
		/** The space between slices, in the same units. */
		gap?: number;
		/** `outside` places each caption around the ring. `inside` shows only the active one, in the hole. */
		captionPlacement?: 'outside' | 'inside';
		/** `default` centers the first slice at 12 o'clock. `tilted` puts a division there with the first slice on its right, `tilted-left` on its left. */
		orientation?: 'default' | 'tilted' | 'tilted-left';
		/** Sits in the hole and shows until the section pins. A Logo's props, so it can change with the theme. */
		image?: Pick<LogoProps, 'src' | 'srcLight' | 'srcDark' | 'alt'>;
		/** Scales the image in the hole, with `1` its normal size. */
		imageScale?: number;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Logo from '$lib/components/logo.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { donutSlice } from '$lib/utils/donut';
	import { loadGsap } from '$lib/utils/gsap';

	// Blank space around the ring inside its box, so a stroke on the active slice is never cut off, and the share of
	// the box the ring itself fills. The hole image is sized from both.
	const PADDING = 4;
	const RING_SHARE = 68;
	// How much scroll each slice gets, as a percent of the screen height.
	const DWELL = 60;

	let {
		slices,
		holeSize = 55,
		radius = 0,
		gap = 0,
		captionPlacement = 'outside',
		orientation = 'default',
		image,
		imageScale = 1,
		id,
		class: className,
		...copy
	}: CircleHighlightProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
	const shapes = $derived(
		slices.map((slice, index) =>
			donutSlice({ index, count: slices.length, holeSize, radius, gap, orientation })
		)
	);
	const hole = $derived(((RING_SHARE * holeSize) / (100 + PADDING * 2)).toFixed(2));

	let pin = $state<HTMLElement>();
	let armed = $state(false);
	let started = $state(false);
	let finale = $state(false);
	let active = $state(0);

	// The pinned frame steps through the slices clockwise, then one more step where every slice lights at once and
	// the caption hides, so the sequence ends on a finish instead of stopping on the last slice. Without
	// JavaScript, or with reduced motion, every slice and caption just shows.
	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches || !slices.length) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then((gsap) => {
			if (cancelled || !pin) return;
			armed = true;
			const steps = slices.length + 1;

			const context = gsap.context(() => {
				gsap.to(pin!, {
					scrollTrigger: {
						trigger: pin,
						start: 'top top',
						end: `+=${steps * DWELL}%`,
						pin: true,
						scrub: 1,
						onEnter: () => (started = true),
						onLeaveBack: () => (started = false),
						onUpdate: (self) => {
							const step = Math.min(steps - 1, Math.floor(self.progress * steps));
							finale = step === slices.length;
							if (step < slices.length) active = step;
						}
					}
				});
			}, pin);
			revert = () => context.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	});
</script>

<section
	{id}
	class="circle-highlight {className ?? ''}"
	class:armed
	class:started
	class:finale
	class:centered={!hasCopy}
>
	<div class="pin" bind:this={pin}>
		{#if hasCopy}
			<div class="content">
				<SectionCopy level={2} {...copy} />
			</div>
		{/if}

		{#if shapes.length}
			<div class="ring-wrap" class:inside={captionPlacement === 'inside'}>
				<svg
					class="ring"
					viewBox="-{PADDING} -{PADDING} {100 + PADDING * 2} {100 + PADDING * 2}"
					aria-hidden="true"
				>
					{#each shapes as shape, index (index)}
						<path class="slice" class:current={index === active} d={shape.path} />
					{/each}
				</svg>

				{#if image}
					<div class="hole-image" style="--hole-diameter: {hole}%; --image-scale: {imageScale}">
						<Logo {...image} />
					</div>
				{/if}

				{#each slices as slice, index (index)}
					<div
						class="caption"
						class:current={index === active}
						style="--slice-angle: {shapes[index].middle}"
					>
						<h3 class="h6">{slice.title}</h3>
						{#if slice.description}<p>{slice.description}</p>{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	// A pinned, scroll-driven donut chart: the ring highlights one slice at a time, always clockwise. Captions sit
	// on the ring's circumference the way Image Circle places its cards, from `--slice-angle` (0 is the top, turning
	// clockwise) and CSS `sin()` / `cos()` against the ring box's own width, so none of it needs script.
	.circle-highlight {
		position: relative;
	}

	.pin {
		// The ring's box is also what the outside captions measure from. They hang past its edge by 15% of its width,
		// so the box keeps that much room to its right.
		--ring-size: min(40vw, 480px);

		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 64px;
		max-width: var(--content-width);
		min-height: 100svh;
		margin-inline: auto;
		padding: 48px var(--body-padding);

		@include mixins.max-lg {
			--ring-size: min(72vw, 420px);

			flex-direction: column;
			gap: 48px;
		}
	}

	.centered .pin {
		--ring-size: min(52vw, 560px);

		justify-content: center;

		@include mixins.max-lg {
			--ring-size: min(72vw, 420px);
		}
	}

	.content {
		flex: 0 1 35%;
		max-width: var(--max-width-text);

		@include mixins.max-lg {
			flex: none;
			width: 100%;
		}
	}

	.ring-wrap {
		position: relative;
		isolation: isolate;
		// Captions measure their distance from the ring against this box's width, not the screen's.
		container-type: inline-size;
		flex: 0 0 auto;
		width: var(--ring-size);
		aspect-ratio: 1;
		margin-inline: auto calc(var(--ring-size) * 0.15);

		@include mixins.max-lg {
			margin-inline: auto;
		}
	}

	// Without copy beside it the captions hang evenly around the ring, so it sits dead center.
	.centered .ring-wrap {
		margin-inline: auto;
	}

	.ring {
		position: absolute;
		// Leaves room outside the ring, inside the same box, for the captions.
		inset: 16%;
		width: 68%;
		height: 68%;
	}

	.slice {
		fill: var(--color-border);

		@include mixins.mq-motion-allow {
			transition: fill 0.4s var(--ease);
		}
	}

	.caption {
		// How far from the center a caption sits, past the ring's own edge.
		--distance: 50cqw;
		--angle: calc(var(--slice-angle, 0) * 1deg);
		--x: calc(sin(var(--angle)) * var(--distance));
		--y: calc(-1 * cos(var(--angle)) * var(--distance));

		position: absolute;
		top: 50%;
		left: 50%;
		width: min(34cqw, 240px);
		translate: calc(-50% + var(--x)) calc(-50% + var(--y));
		text-align: center;

		h3,
		p {
			margin: 0;
		}

		p {
			margin-block-start: 4px;
			color: var(--color-text-muted);
			font-size: 14px;
		}

		@include mixins.mq-motion-allow {
			transition: opacity 0.4s var(--ease);
		}
	}

	// Inside, every caption is stacked in the middle of the ring and only the active one shows.
	.inside .caption {
		--distance: 0px;
	}

	.hole-image {
		position: absolute;
		top: 50%;
		left: 50%;
		display: grid;
		place-items: center;
		width: var(--hole-diameter, 40%);
		padding-inline: 12%;
		translate: -50% -50%;
		scale: var(--image-scale, 1);

		@include mixins.mq-motion-allow {
			transition: opacity 0.4s var(--ease);
		}

		--logo-height: auto;

		:global(.logo) {
			width: 100%;
			justify-content: center;
		}

		:global(.logo img) {
			width: 100%;
		}
	}

	// Armed, nothing is highlighted and no caption shows until the scroll reaches the pin (`started`). With
	// captions inside, the logo then gives the hole to the caption.
	.armed {
		.caption {
			opacity: 0;
		}

		&.started .caption.current {
			opacity: 1;
		}

		&.started .inside .hole-image {
			opacity: 0;
		}

		&.started .slice.current,
		&.finale .slice {
			fill: var(--color-accent);
			stroke: var(--color-text);
			stroke-width: 0.5px;
		}

		&.finale .caption.current {
			opacity: 0;
		}
	}

	// Without the scroll-driven version every slice and caption just shows, around the ring, even with captions inside.
	.circle-highlight:not(.armed) {
		.slice {
			fill: var(--color-accent);
		}

		.caption {
			--distance: 50cqw;
		}
	}
</style>
