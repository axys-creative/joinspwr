<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';
	import type { TextEffect } from '$lib/utils/text-effect';

	export type CarouselTunnelSlide = {
		img: { src: string; alt?: string };
		/** Adds a Watch button to the slide that opens this video in a Video Overlay. */
		video?: { src: string; poster?: string; title?: string; captions?: string };
		eyebrow?: string;
		title?: string;
	};

	export type CarouselTunnelConfig = {
		/** Total scroll distance of the section, e.g. `220svh`. */
		sectionHeight?: string;
		/** The resting slide width, which sets how much of the next slides peek in, e.g. `min(25vw, 720px)`. */
		slideWidth?: string;
		slideGap?: string;
		/** A CSS aspect ratio, e.g. `2 / 1.25`. */
		slideAspect?: string;
		/** The share of the scroll (0–1) spent zooming out. The copy, captions and arrows reveal, and autoplay starts, when it ends. */
		scaleDuration?: number;
		/** Seconds the slide beside the active one takes to catch up with the zoom; two away take twice as long. `0` zooms them together. */
		trail?: number;
		/** Seconds for the fade of that reveal. */
		revealDuration?: number;
		/** Space between a caption and the slide's bottom left corner, e.g. `12px`. */
		captionOffset?: string;
	};

	export type CarouselTunnelProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'title'
	> & {
		description?: string;
		slides: CarouselTunnelSlide[];
		autoplay?: {
			/** Milliseconds between slides. `0` turns autoplay off. */
			interval?: number;
			/** Advances one slide a second after it reveals, instead of waiting a full interval. */
			quickStart?: boolean;
		};
		titleEffect?: TextEffect;
		descriptionEffect?: TextEffect;
		/** The share of a slide's width a drag must cross to change slides. Lower is more sensitive. */
		dragThreshold?: number;
		pagination?: 'arrows' | 'dots' | 'both';
		/** A faint row of thin ticks behind the slides, revealed with the copy. */
		ticks?: boolean;
		config?: CarouselTunnelConfig;
		/** The carousel's accessible name. */
		label?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import { onMount, tick } from 'svelte';
	import Button from '$lib/components/button.svelte';
	import Eyebrow from '$lib/components/eyebrow.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import VideoOverlay from '$lib/components/video-overlay.svelte';
	import { loadGsap, refreshScrollTriggers } from '$lib/utils/gsap';
	import { prepareTextEffect } from '$lib/utils/text-effect';

	let {
		slides,
		eyebrowText,
		eyebrowIcon,
		title,
		description,
		autoplay,
		titleEffect = 'reveal',
		descriptionEffect = 'none',
		dragThreshold = 0.1,
		pagination = 'arrows',
		ticks = true,
		config,
		label = 'Featured work',
		class: className
	}: CarouselTunnelProps = $props();

	const interval = $derived(autoplay?.interval ?? 4500);
	const quickStart = $derived(autoplay?.quickStart ?? false);
	const scaleDuration = $derived(config?.scaleDuration ?? 0.6);
	const trail = $derived(config?.trail ?? 0.35);

	// Only what is set becomes a custom property, so the stylesheet's own defaults (including the smaller mobile
	// slide width) stay in charge of the rest.
	const style = $derived(
		(
			[
				['--section-height', config?.sectionHeight],
				['--slide-width', config?.slideWidth],
				['--slide-gap', config?.slideGap],
				['--slide-aspect', config?.slideAspect],
				['--reveal-duration', config?.revealDuration && `${config.revealDuration}s`],
				['--caption-offset', config?.captionOffset]
			] as const
		)
			.filter(([, value]) => value)
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ')
	);

	let pin = $state<HTMLElement>();
	let viewport = $state<HTMLElement>();
	let scaler = $state<HTMLElement>();
	let track = $state<HTMLElement>();
	let content = $state<HTMLElement>();

	// `armed` is the scroll-driven version: pinned and zooming, with the copy hidden until the zoom ends. Without
	// JavaScript, or with reduced motion, it stays a plain carousel with everything showing.
	let armed = $state(false);
	let revealed = $state(false);
	let dragging = $state(false);
	let videoOpen = $state(false);
	let video = $state<NonNullable<CarouselTunnelSlide['video']>>();

	const openVideo = (slide: CarouselTunnelSlide) => {
		if (!slide.video) return;
		video = slide.video;
		videoOpen = true;
	};
	// With reduced motion nothing advances on its own.
	let calm = $state(false);
	let cloneCount = $state(0);
	let index = $state(0);

	const count = $derived(slides.length);
	const canLoop = $derived(count > 1);
	const active = $derived((((index - cloneCount) % count) + count) % count);
	const shown = $derived(
		cloneCount
			? [
					...slides.slice(-cloneCount).map((slide, at) => ({ slide, clone: true, key: `a${at}` })),
					...slides.map((slide, at) => ({ slide, clone: false, key: `r${at}` })),
					...slides.slice(0, cloneCount).map((slide, at) => ({ slide, clone: true, key: `b${at}` }))
				]
			: slides.map((slide, at) => ({ slide, clone: false, key: `r${at}` }))
	);

	let gsap: Awaited<ReturnType<typeof loadGsap>> | undefined;
	let animating = false;
	let timer: ReturnType<typeof setInterval> | undefined;
	let quickStartPending = false;
	const QUICK_START_DELAY = 1000;

	const step = () => {
		const first = track!.children[0] as HTMLElement;
		return first.offsetWidth + (parseFloat(getComputedStyle(track!).columnGap) || 0);
	};

	// Slides are placed in the track's own pixels, so the zoom (on the scaler around it) never moves the active one.
	function goTo(to: number, animate = true) {
		if (!gsap || !track || !viewport) return;
		if (animate && animating) return;

		const slideWidth = (track.children[0] as HTMLElement).offsetWidth;
		const x = viewport.offsetWidth / 2 - (to * step() + slideWidth / 2);
		const move = animate && !matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (move) animating = true;

		gsap.to(track, {
			x,
			duration: move ? 0.7 : 0,
			ease: 'power2.inOut',
			onComplete: () => {
				animating = false;
				if (!canLoop) return;
				// Landed on a clone: snap to the real slide it copies, with no transition, so the loop is unseen.
				if (to >= cloneCount + count) {
					index = to - count;
					goTo(index, false);
				} else if (to < cloneCount) {
					index = to + count;
					goTo(index, false);
				}
			}
		});
		index = to;
	}

	const next = () => goTo(index + 1);
	const previous = () => goTo(index - 1);

	function restart() {
		clearInterval(timer);
		timer = undefined;
		if (revealed && !videoOpen && !calm && canLoop && interval > 0 && !document.hidden) {
			if (quickStartPending) {
				quickStartPending = false;
				timer = setTimeout(() => {
					next();
					timer = setInterval(next, interval);
				}, QUICK_START_DELAY);
			} else {
				timer = setInterval(next, interval);
			}
		}
	}

	$effect(() => {
		// Rerun whenever any of these change.
		void [revealed, videoOpen, calm, interval, canLoop];
		restart();
		return () => clearInterval(timer);
	});

	// Enough clones on each end to fill half the viewport, so no gap shows at the loop's edge.
	async function measure() {
		if (!viewport || !track || !canLoop) return;
		const first = track.children[cloneCount] as HTMLElement | undefined;
		if (!first) return;
		const perSide = Math.ceil(viewport.offsetWidth / 2 / step()) + 1;
		const wanted = Math.min(Math.max(perSide, 1), count);
		const here = cloneCount ? active : 0;

		if (wanted !== cloneCount) {
			cloneCount = wanted;
			index = wanted + here;
			await tick();
		}
		goTo(index, false);
	}

	let startX = 0;
	let startTrackX = 0;

	function onpointerdown(event: PointerEvent) {
		if (!revealed || !gsap || !track) return;
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		dragging = true;
		startX = event.clientX;
		startTrackX = gsap.getProperty(track, 'x') as number;
		gsap.killTweensOf(track);
		animating = false;
		track.setPointerCapture(event.pointerId);
		clearInterval(timer);
	}

	function onpointermove(event: PointerEvent) {
		if (dragging && gsap && track) gsap.set(track, { x: startTrackX + (event.clientX - startX) });
	}

	function onpointerup(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;

		const dragged = -(event.clientX - startX);
		const maxJump = canLoop ? cloneCount : 0;
		// Crossing the threshold's share of one slide advances it, and each whole slide after that advances another.
		const crossed = Math.floor(Math.abs(dragged) / step() + (1 - dragThreshold));
		const delta = Math.max(-maxJump, Math.min(maxJump, Math.sign(dragged) * crossed));
		goTo(index + delta);
		restart();
	}

	onMount(() => {
		let cancelled = false;
		let cleanups: (() => void)[] = [];

		const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		calm = !motion;

		(async () => {
			const core = await loadGsap(...(motion ? (['scrollTrigger'] as const) : []));
			gsap = core;
			if (cancelled) return;

			await measure();
			const onResize = () => measure();
			addEventListener('resize', onResize);
			cleanups.push(() => removeEventListener('resize', onResize));

			if (!motion || !pin || !scaler) {
				revealed = true;
				return;
			}

			armed = true;
			await tick();

			const titleEl = content?.querySelector<HTMLElement>('h2');
			const descriptionEl = content?.querySelector<HTMLElement>('.description');
			const [titlePlay, descriptionPlay] = await Promise.all([
				titleEl ? prepareTextEffect(titleEl, titleEffect) : undefined,
				descriptionEl ? prepareTextEffect(descriptionEl, descriptionEffect) : undefined
			]);
			if (cancelled) {
				titlePlay?.revert();
				descriptionPlay?.revert();
				return;
			}
			cleanups.push(() => {
				titlePlay?.revert();
				descriptionPlay?.revert();
			});

			// Enough zoom that the active slide covers the whole frame, whatever its size and shape.
			const slide = track!.children[cloneCount] as HTMLElement;
			const start = Math.max(
				pin.offsetWidth / slide.offsetWidth,
				pin.offsetHeight / slide.offsetHeight,
				1
			);
			core.set(scaler, { scale: start });

			const context = core.context(() => {
				const timeline = core.timeline({
					scrollTrigger: {
						trigger: pin,
						start: 'top top',
						end: '+=125%',
						pin: true,
						scrub: 1,
						invalidateOnRefresh: true,
						// The copy, captions and arrows reveal, and autoplay starts, once the zoom has finished.
						onUpdate: (self) => {
							const done = self.progress >= scaleDuration;
							if (done === revealed) return;
							revealed = done;
							if (done) {
								titlePlay?.play();
								descriptionPlay?.play();
								if (quickStart && canLoop && interval > 0) quickStartPending = true;
							}
						}
					}
				});
				timeline.to(scaler!, { scale: 1, ease: 'power2.out', duration: scaleDuration }, 0);
				if (trail > 0) {
					// Each slide has its own scale chasing the scaler's, so the neighbors trail while scrolling and catch up when
					// it stops. A slide's extra scale and shift, around the scaler's center, make it land on that scale.
					const pull = { progress: 0 };
					const slideEls = Array.from(track!.children) as HTMLElement[];
					const own = slideEls.map(() => start);
					const place = () => {
						const zoom = Number(core.getProperty(scaler!, 'scale'));
						const trackX = Number(core.getProperty(track!, 'x')) || 0;
						const middle = scaler!.offsetWidth / 2;
						slideEls.forEach((el, at) => {
							const k = own[at] / zoom;
							if (Math.abs(k - 1) < 0.0005) return core.set(el, { clearProps: 'transform' });
							const center = trackX + el.offsetLeft + el.offsetWidth / 2 - middle;
							core.set(el, { scale: k, x: center * (k - 1) });
						});
					};
					const chase = () => {
						const zoom = Number(core.getProperty(scaler!, 'scale'));
						slideEls.forEach((_, at) => {
							const distance = Math.abs(at - index);
							core.killTweensOf(own, String(at));
							if (distance < 1 || distance > 2) {
								own[at] = zoom;
								return;
							}
							core.to(own, {
								[at]: zoom,
								duration: trail * distance,
								ease: 'power2.out',
								onUpdate: place
							});
						});
						place();
					};
					timeline.to(
						pull,
						{ progress: 1, ease: 'none', duration: scaleDuration, onUpdate: chase },
						0
					);
				}
				// Pads the timeline so the scrub keeps its dwell time after the zoom, instead of ending with it.
				timeline.set({}, {}, 1);
			}, pin);
			cleanups.push(() => {
				context.revert();
				core.set(track!.children, { clearProps: 'transform' });
			});
			refreshScrollTriggers();
		})();

		const onVisibility = () => restart();
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			cancelled = true;
			document.removeEventListener('visibilitychange', onVisibility);
			cleanups.forEach((cleanup) => cleanup());
			clearInterval(timer);
			if (gsap && track) gsap.killTweensOf(track);
		};
	});
</script>

<section
	class="carousel-tunnel {className ?? ''}"
	class:armed
	class:revealed
	aria-roledescription="carousel"
	aria-label={label}
	{style}
>
	<div class="pin" bind:this={pin}>
		{#if eyebrowText || eyebrowIcon || title || description}
			<div class="content" bind:this={content}>
				<SectionCopy level={2} align="center" {eyebrowText} {eyebrowIcon} {title} {description} />
			</div>
		{/if}

		<div class="viewport" bind:this={viewport}>
			{#if ticks}<div class="ticks" aria-hidden="true"></div>{/if}
			<div class="scaler" bind:this={scaler}>
				<!-- Dragging with a pointer is an extra; the arrows and dots do the same with a keyboard. -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="track"
					class:dragging
					bind:this={track}
					{onpointerdown}
					{onpointermove}
					{onpointerup}
					onpointercancel={onpointerup}
				>
					{#each shown as { slide, clone, key }, at (key)}
						<div
							class="slide"
							style:z-index={Math.max(0, 3 - Math.abs(at - index))}
							role={clone ? undefined : 'group'}
							aria-roledescription={clone ? undefined : 'slide'}
							aria-hidden={clone ? 'true' : undefined}
						>
							<img
								{...imageProps(slide.img.src, { sizes: '100vw' })}
								alt={slide.img.alt ?? ''}
								draggable="false"
							/>
							{#if slide.video}
								<Button
									class="watch"
									type="solid"
									size="sm"
									iconStart="play"
									text="Watch"
									textDescription="Play video{slide.title ? `: ${slide.title}` : ''}"
									tabindex={clone || !revealed ? -1 : undefined}
									onpointerdown={(event) => event.stopPropagation()}
									onclick={() => openVideo(slide)}
								/>
							{/if}
							{#if slide.eyebrow || slide.title}
								<div class="caption">
									{#if slide.eyebrow}<Eyebrow text={slide.eyebrow} />{/if}
									{#if slide.title}<h3 class="h6">{slide.title}</h3>{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>

		{#if canLoop}
			<div class="pagination">
				{#if pagination !== 'dots'}
					<Button
						type="solid"
						iconStart="/uploads/icon-arrow-left.svg"
						textDescription="Previous slide"
						class="arrow previous"
						onclick={() => {
							previous();
							restart();
						}}
					/>
				{/if}
				{#if pagination !== 'arrows'}
					<div class="dots">
						{#each slides as slide, at (at)}
							<button
								type="button"
								class="dot"
								class:current={at === active}
								aria-label="Go to slide {at + 1}{slide.title ? `: ${slide.title}` : ''}"
								aria-current={at === active ? 'true' : undefined}
								onclick={() => {
									goTo(cloneCount + at);
									restart();
								}}
							></button>
						{/each}
					</div>
				{/if}
				{#if pagination !== 'dots'}
					<Button
						type="solid"
						iconStart="/uploads/icon-arrow-right.svg"
						textDescription="Next slide"
						class="arrow"
						onclick={() => {
							next();
							restart();
						}}
					/>
				{/if}
			</div>
		{/if}
	</div>
	{#if video}
		<VideoOverlay bind:open={videoOpen} {...video} />
	{/if}
</section>

<style lang="scss">
	@use 'base/mixins';

	// Zooms out of a full-screen image into a carousel with the next slides peeking in. Nothing is cropped on the
	// way: the scaler shrinks everything inside it, track and slides together. The track is a separate element
	// so sliding (x) and zooming (scale) never fight over one transform.
	.carousel-tunnel {
		--section-height: 220svh;
		--slide-width: min(25vw, 720px);
		--slide-gap: 24px;
		--slide-aspect: 2 / 1.25;
		--reveal-duration: 0.6s;
		--caption-offset: 12px;

		position: relative;

		@include mixins.max-md {
			--slide-width: min(84vw, 480px);
		}
	}

	.armed {
		height: var(--section-height);
	}

	.pin {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 32px;
		width: 100%;
		padding-block: 64px;
		overflow: hidden;
	}

	.armed .pin {
		height: 100svh;
		padding-block: 0;
	}

	.viewport {
		position: relative;
		width: 100%;
	}

	.ticks {
		position: absolute;
		inset-inline: 0;
		top: 50%;
		height: 16px;
		translate: 0 -50%;
		background: repeating-linear-gradient(
			90deg,
			var(--tick-color, var(--color-surface)) 0 1px,
			transparent 1px 8px
		);
		pointer-events: none;
	}

	.scaler {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		transform-origin: center;
	}

	.track {
		display: flex;
		align-items: center;
		gap: var(--slide-gap);
		user-select: none;
		touch-action: pan-y;
	}

	.revealed .track {
		cursor: grab;
	}

	.dragging {
		cursor: grabbing;
	}

	.slide {
		position: relative;
		flex: 0 0 auto;
		width: var(--slide-width);
		aspect-ratio: var(--slide-aspect);
		overflow: hidden;
		border-radius: var(--radius);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
	}

	.slide :global(.watch) {
		position: absolute;
		top: var(--caption-offset);
		left: var(--caption-offset);
		z-index: 1;

		@include mixins.min-md {
			@media (hover: hover) {
				top: auto;
				right: var(--caption-offset);
				bottom: var(--caption-offset);
				left: auto;
				opacity: 0;
				translate: 0 12px;

				@include mixins.mq-motion-allow {
					transition:
						opacity var(--duration) var(--ease),
						translate var(--duration) var(--ease),
						background var(--duration) var(--ease),
						color var(--duration) var(--ease),
						border-color var(--duration) var(--ease),
						scale var(--duration) var(--ease);
				}
			}
		}
	}

	.slide:hover :global(.watch),
	.slide:focus-within :global(.watch) {
		opacity: 1;
		translate: 0;
	}

	.armed .slide :global(.watch) {
		visibility: hidden;
		pointer-events: none;
	}

	.armed.revealed .slide :global(.watch) {
		visibility: visible;
		pointer-events: auto;
	}

	.caption {
		position: absolute;
		inset: auto var(--caption-offset) var(--caption-offset);
		color: #fff;
		text-shadow: 0 1px 4px rgb(0 0 0 / 0.8);
		pointer-events: none;

		h3 {
			margin: 0;
		}
	}

	// Hidden until the zoom ends, then faded in. It is a played fade, not tied to the scroll.
	.armed {
		.content,
		.pagination,
		.caption,
		.ticks {
			visibility: hidden;
			opacity: 0;
			pointer-events: none;
			user-select: none;

			@include mixins.mq-motion-allow {
				transition:
					opacity var(--reveal-duration) var(--ease),
					visibility var(--reveal-duration);
			}
		}

		&.revealed {
			.content,
			.pagination,
			.caption,
			.ticks {
				visibility: visible;
				opacity: 1;
			}

			.pagination {
				pointer-events: auto;
			}
		}
	}

	.content {
		z-index: 2;
		width: 100%;
		padding-inline: var(--body-padding);
	}

	.pagination {
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		width: 100%;
		padding-inline: var(--body-padding);
	}

	.pagination :global(.arrow) {
		--btn-font-size: 24px;

		width: 40px;
		height: 40px;
		padding: 0;
	}

	.dots {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.dot {
		width: 8px;
		height: 8px;
		padding: 0;
		border-radius: 50%;
		background: var(--color-border);

		@include mixins.mq-motion-allow {
			transition:
				background var(--duration) var(--ease),
				scale var(--duration) var(--ease);
		}

		&.current {
			background: var(--color-text);
			scale: 1.3;
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 3px;
		}
	}
</style>
