<script module lang="ts">
	export type HeroGnomonSlide = Pick<SectionCopyProps, 'title'> & {
		/** A date or date range, as text, shown left of the info button. */
		date?: string;
		/** A primary button at the bottom of the overlay. */
		cta?: Pick<ButtonProps, 'text' | 'url' | 'newTab' | 'textDescription'>;
		/** Plain text shown in the overlay over the frame when the info button is open. */
		description?: string;
		image: { src: string; alt?: string };
	};

	export type HeroGnomonFigure = { src: string; alt?: string };

	export type HeroGnomonProps = {
		/** One entry per slide: the picture in the frame, the title in the notch at the bottom left, and a description behind the info button. */
		slides: HeroGnomonSlide[];
		/** The accessible name of the carousel. */
		label?: string;
		/** The page's heading, in rich text, above the frame, centered, with the description below it. The slide titles then drop to level 2. */
		title?: string;
		/** Plain or rich text below `title`. */
		description?: string;
		/** Two cutout pictures that stay put on every slide, standing in the bottom corners of the frame above the notches. */
		figures?: { left?: HeroGnomonFigure; right?: HeroGnomonFigure };
		/** `interval` is milliseconds between slides. Pauses while hovered or focused, and is off when motion is reduced. */
		autoplay?: { enabled?: boolean; interval?: number };
		/** `cover` fills the frame and crops; `contain` shows the whole picture. */
		fit?: 'cover' | 'contain';
		/** 45-90 degrees. How far the notch's wall leans: 90 is a square step, lower tilts it toward a diagonal. */
		angle?: number;
		/** The corner curve in px. */
		radius?: number;
		/** The stroke width in px. */
		borderWidth?: number;
		/** At least the height of the screen, with the frame filling it. Otherwise half the screen, never under 650px. Taller content still grows past either. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Button, { type ButtonProps } from '$lib/components/button.svelte';
	import CtaGroup from '$lib/components/cta-group.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { edgeNotchBoxPath, roundedBoxPath } from '$lib/utils/gnomon';
	import { imageProps } from '$lib/utils/image';

	const NOTCH_PADDING = 48;
	const DEFAULT_INTERVAL = 6000;

	let {
		slides,
		label = 'Highlights',
		title,
		description,
		figures,
		autoplay,
		fit = 'cover',
		angle = 70,
		radius = 28,
		borderWidth = 2,
		fullScreen = false,
		id,
		class: className
	}: HeroGnomonProps = $props();

	let index = $state(0);
	let paused = $state(false);
	let open = $state(false);

	const overlayId = $props.id();
	let width = $state(0);
	let height = $state(0);
	let left = $state({ height: 0 });
	let right = $state({ height: 0 });
	let titleWidth = $state(0);
	let slideWidths = $state<number[]>([]);
	let arrowsWidth = $state(0);
	// Below md the title moves to a notch at the top left, and the controls stay in the one at the bottom right.
	let compact = $state(false);

	const interval = $derived(autoplay?.interval || DEFAULT_INTERVAL);
	const hasDate = $derived(slides.some((slide) => slide.date));
	const hasInfo = $derived(slides.some((slide) => slide.description));
	const playing = $derived(!!autoplay?.enabled && slides.length > 1);
	// Each notch is as wide as its own content plus the room it needs on its inner side. The title notch follows the
	// active title and eases between widths.
	const activeTitleWidth = $derived((slideWidths[index] || titleWidth) + NOTCH_PADDING);
	const titleNotch = new Tween(0, { duration: 450, easing: cubicOut });
	const titleNotchWidth = $derived(titleNotch.current);
	const controlsNotchWidth = $derived(arrowsWidth + NOTCH_PADDING);
	// How far the notches reach in from the bottom and the top, for the overlay and the minimum height to clear.
	const bottomReach = $derived(compact ? right.height : Math.max(left.height, right.height));
	const topReach = $derived(compact ? left.height : 0);
	const shape = $derived(
		width && height
			? left.height
				? edgeNotchBoxPath(
						width,
						height,
						[
							{
								align: 'left',
								edge: compact ? 'top' : 'bottom',
								width: titleNotchWidth,
								height: left.height
							},
							...(right.height
								? [{ align: 'right' as const, width: controlsNotchWidth, height: right.height }]
								: [])
						],
						radius,
						angle
					)
				: roundedBoxPath(width, height, radius)
			: ''
	);

	let shownIndex = -1;

	// Eases only when the slide changes; a re-measure from a resize or a late font applies at once.
	$effect(() => {
		const target = activeTitleWidth;
		const changed = shownIndex !== -1 && shownIndex !== index;
		const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
		shownIndex = index;
		titleNotch.set(target, changed && !calm ? undefined : { duration: 0 });
	});

	const move = (step: number) => {
		index = (index + step + slides.length) % slides.length;
	};

	$effect(() => {
		const query = matchMedia('(max-width: 767px)');
		const update = () => (compact = query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	// Rerunning on `index` restarts the countdown after a manual change too.
	$effect(() => {
		if (!playing || paused || open) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const timer = setTimeout(() => move(1), interval);
		return () => clearTimeout(timer);
	});
</script>

{#snippet arrows()}
	<div class="controls" bind:clientWidth={arrowsWidth}>
		{#if hasDate}
			<div class="dates">
				{#each slides as slide, i (i)}
					<span class="slide" class:active={i === index} inert={i !== index}>{slide.date}</span>
				{/each}
			</div>
		{/if}
		{#if hasInfo}
			<Button
				iconStart={open ? 'x-lg' : 'info-circle'}
				textDescription={open ? 'Hide details' : 'Show details'}
				expanded={open}
				controls={overlayId}
				onclick={() => (open = !open)}
			/>
		{/if}
		{#if slides.length > 1}
			<div class="arrows">
				<Button
					class="prev"
					iconStart="chevron-right"
					textDescription="Previous slide"
					onclick={() => move(-1)}
				/>
				<Button iconStart="chevron-right" textDescription="Next slide" onclick={() => move(1)} />
			</div>
		{/if}
	</div>
{/snippet}

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') open = false;
	}}
/>

<section
	{id}
	class="hero-gnomon page-grid {className ?? ''}"
	class:full-screen={fullScreen}
	aria-label={label}
	aria-roledescription="carousel"
	onpointerenter={() => (paused = true)}
	onpointerleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	{#if title}
		<div class="intro">
			<SectionCopy
				level={1}
				align="center"
				{title}
				{description}
				showEyebrow={false}
				showCta={false}
			/>
		</div>
	{/if}
	<div
		class="shell"
		class:fit-contain={fit === 'contain'}
		style="--border-width: {borderWidth}px; --notch-bottom: {bottomReach}px; --notch-top: {topReach}px"
		bind:clientWidth={width}
		bind:clientHeight={height}
	>
		{#if shape}
			<div class="surface" style="clip-path: path('{shape}')">
				{#each slides as slide, i (i)}
					<img
						{...imageProps(slide.image.src, { sizes: '(min-width: 1200px) 1200px, 100vw' })}
						alt={i === index ? (slide.image.alt ?? '') : ''}
						aria-hidden={i === index ? undefined : true}
						class="photo"
						class:active={i === index}
						loading={i === 0 ? 'eager' : 'lazy'}
						fetchpriority={i === 0 ? 'high' : undefined}
					/>
				{/each}
				{#each ['left', 'right'] as const as side (side)}
					{@const figure = figures?.[side]}
					{#if figure?.src}
						<img
							{...imageProps(figure.src, { sizes: '(min-width: 768px) 320px, 200px' })}
							class="figure {side}"
							style="bottom: {side === 'left' && compact
								? 0
								: side === 'left'
									? left.height
									: right.height}px"
							alt={figure.alt ?? ''}
							loading="eager"
						/>
					{/if}
				{/each}
				<div class="info" class:open id={overlayId} inert={!open}>
					<div class="info-copy">
						{#each slides as slide, i (i)}
							<div class="slide detail" class:active={i === index}>
								{#if slide.date}<span class="date">{slide.date}</span>{/if}
								<p><RichText text={slide.description} /></p>
								{#if slide.cta?.text}
									<CtaGroup primary={slide.cta} />
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
			<svg class="stroke" viewBox="0 0 {width} {height}" aria-hidden="true">
				<path d={shape} />
			</svg>
		{/if}

		<div
			class="notch left"
			class:top={compact}
			style="width: {titleNotchWidth}px"
			bind:clientHeight={left.height}
		>
			<div
				class="copy"
				bind:clientWidth={titleWidth}
				aria-live={playing && !paused ? 'off' : 'polite'}
			>
				{#each slides as slide, i (i)}
					<div
						class="slide"
						class:active={i === index}
						role="group"
						aria-roledescription="slide"
						bind:clientWidth={slideWidths[i]}
						aria-label="{i + 1} of {slides.length}"
						inert={i !== index}
					>
						<SectionCopy
							level={title ? 2 : 1}
							titleStyle="h3"
							title={slide.title}
							align="start"
							showEyebrow={false}
							showDescription={false}
							showCta={false}
						/>
					</div>
				{/each}
			</div>
		</div>

		<div class="notch right" style="width: {controlsNotchWidth}px" bind:clientHeight={right.height}>
			{@render arrows()}
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.hero-gnomon {
		// Clears the floating header, which sits over the top of the frame.
		margin-block: 120px 48px;

		@include mixins.max-md {
			margin-block: 96px 32px;
		}
	}

	.hero-gnomon:has(.intro) {
		margin-block-start: 184px;

		@include mixins.max-md {
			margin-block-start: 136px;
		}
	}

	.intro {
		margin-block-end: 32px;

		:global(.section-copy) {
			max-width: 1000px;
		}

		:global(.description) {
			max-width: 640px;
		}
	}

	.shell {
		position: relative;
		min-height: max(650px, 50lvh, calc(var(--notch-bottom) + var(--notch-top) + 320px));
	}

	.full-screen .shell {
		min-height: max(calc(100lvh - 168px), calc(var(--notch-bottom) + var(--notch-top) + 320px));
	}

	// The picture is clipped to the same outline as the stroke, so its edge sits on the line.
	.surface {
		position: absolute;
		inset: 0;
		background: var(--color-surface);

		.photo {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0;

			&.active {
				opacity: 1;
			}

			@include mixins.mq-motion-allow {
				transition: opacity 0.8s var(--ease);
			}
		}
	}

	.fit-contain .surface .photo {
		object-fit: contain;
	}

	.stroke {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
		pointer-events: none;

		path {
			fill: none;
			stroke: var(--color-border);
			stroke-width: var(--border-width);
		}
	}

	// Each notch is empty page, so its content sits on the page, not on the picture. The padding on the inner side
	// leaves room for the leaning wall.
	.notch {
		position: absolute;
		bottom: 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-sizing: border-box;
		--space-eyebrow-title: 0;
	}

	.left {
		left: 0;
		align-items: flex-start;
		padding: 16px 48px 0 0;
	}

	// Below md the title sits in the notch at the top left, with its room on the bottom edge.
	.top {
		top: 0;
		bottom: auto;
		padding: 0 48px 16px 0;
	}

	.right {
		right: 0;
		padding: 16px 0 0 48px;
		align-items: flex-end;
	}

	// Every slide takes the same cell, so the notch is as wide as the longest title and never jumps between slides.
	.copy {
		display: grid;
		width: max-content;
	}

	.slide {
		grid-area: 1 / 1;
		justify-self: start;
		visibility: hidden;
		opacity: 0;

		&.active {
			visibility: visible;
			opacity: 1;
		}

		@include mixins.mq-motion-allow {
			translate: 0 12px;
			transition:
				opacity 0.6s var(--ease),
				translate 0.6s var(--ease),
				visibility 0.6s;

			&.active {
				translate: 0 0;
			}
		}
	}

	.copy :global(h1) {
		margin: 0;
		line-height: 1;
		white-space: nowrap;
	}

	// Cutouts stand on top of the notches, so the cut never crops them.
	.figure {
		position: absolute;
		height: 64%;
		width: auto;
		pointer-events: none;

		&.left {
			left: 0;
		}

		&.right {
			right: 0;
		}

		@include mixins.max-md {
			height: 42%;
		}
	}

	.info {
		position: absolute;
		inset: 0;
		display: grid;
		align-items: center;
		padding: calc(var(--notch-top) + 48px) 48px calc(var(--notch-bottom) + 24px);
		color: #fff;
		background: rgb(0 0 0 / 0.72);
		backdrop-filter: blur(12px);
		visibility: hidden;
		opacity: 0;

		&.open {
			visibility: visible;
			opacity: 1;
		}

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.4s var(--ease),
				visibility 0.4s;
		}

		@include mixins.max-md {
			padding-inline: 24px;
		}
	}

	.info-copy {
		display: grid;
		max-width: 560px;
		margin-inline: auto;

		p {
			margin: 0;
			font-size: clamp(18px, 2vw, 24px);
			line-height: 1.4;
		}
	}

	.detail {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;

		:global(.cta-group) {
			margin-top: 12px;
		}
	}

	.date {
		opacity: 0.7;
		font-size: 14px;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	// Every slide's date takes the same cell, so the controls are as wide as the longest and never shift.
	.dates {
		display: grid;
		margin-inline-end: 12px;
		color: var(--color-text-muted);
		font-size: 14px;
		white-space: nowrap;
	}

	.arrows {
		display: flex;
		gap: 12px;

		:global(.prev .icon) {
			rotate: 180deg;
		}
	}
</style>
