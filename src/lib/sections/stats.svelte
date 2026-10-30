<script module lang="ts">
	import type { CounterProps } from '$lib/components/counter.svelte';

	export type StatItem = Pick<CounterProps, 'digit' | 'prefix' | 'suffix' | 'label' | 'comma'> & {
		/** Lands on the stack with this stat when the section is `pinned`. */
		image?: { src: string; alt?: string };
	};

	export type StatsProps = {
		/** Rich text: `[words]{.primary}` tokens add color, scribble and more, and `{.br}` breaks the line. */
		title?: string;
		/** A picture under the title. Stats with their own `image` replace it with a stack of them. */
		image?: { src: string; alt?: string };
		/** Four fit the two by two grid; more continue in rows of two. */
		stats: StatItem[];
		/** Pins the section while the page scrolls: each stat counts up in turn as its picture drops onto the stack. Wider than `md` only. */
		pinned?: boolean;
		/** Count up again each time the grid scrolls into view, instead of only the first time. */
		repeat?: boolean;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Counter from '$lib/components/counter.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';
	import { loadGsap } from '$lib/utils/gsap';

	let {
		title,
		image,
		stats,
		repeat = false,
		pinned = false,
		fullScreen = false,
		id,
		class: className
	}: StatsProps = $props();

	const tilts = [0, -6, 8, -5];
	const pictures = $derived(stats.map((stat) => stat.image).filter((picture) => !!picture?.src));

	let live = $state(false);
	let revealed = $state(0);

	// Pinned, the stats and their pictures appear one at a time; each picture drops in larger and turned, and settles tilted.
	const pin = (el: HTMLElement) => {
		if (!pinned) return;
		let cancelled = false;
		let revert: (() => void) | undefined;

		loadGsap('scrollTrigger').then((gsap) => {
			if (cancelled) return;
			const match = gsap.matchMedia();
			match.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
				const items = gsap.utils.toArray<HTMLElement>('[data-stat]', el);
				const photos = gsap.utils.toArray<HTMLElement>('[data-photo]', el);
				const timeline = gsap.timeline({
					defaults: { ease: 'none' },
					scrollTrigger: {
						trigger: el,
						start: 'top top',
						end: () => `+=${innerHeight * items.length * 0.7}`,
						pin: true,
						scrub: 0.6,
						invalidateOnRefresh: true,
						onUpdate: (self) => {
							revealed =
								self.progress > 0
									? Math.min(
											items.length,
											Math.floor(self.progress * timeline.duration() + 0.05) + 1
										)
									: 0;
						}
					}
				});

				items.forEach((item, index) => {
					timeline.fromTo(
						item,
						{ autoAlpha: 0, y: 32 },
						{ autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
						index
					);
				});
				photos.forEach((photo, index) => {
					const tilt = Number(photo.dataset.tilt);
					timeline.fromTo(
						photo,
						{ autoAlpha: 0, scale: 1.7, x: 0, y: -48, rotation: tilt + (index % 2 ? -28 : 28) },
						{
							autoAlpha: 1,
							scale: 1,
							x: index * 32,
							y: index * 32,
							rotation: tilt,
							duration: 0.9,
							ease: 'power3.out'
						},
						index
					);
				});
				timeline.to({}, { duration: 0.6 });

				live = true;
				return () => {
					live = false;
					revealed = 0;
				};
			});
			revert = () => match.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	};
</script>

<section
	{id}
	class="stats-section {className ?? ''}"
	class:full-screen={fullScreen}
	class:pinned
	{@attach pin}
>
	<div class="inner">
		<div class="copy">
			<SectionCopy level={2} {title} showEyebrow={false} showDescription={false} showCta={false} />

			{#if pictures.length}
				<div class="stack">
					{#each stats as stat, index (index)}
						{#if stat.image?.src}
							<img
								class="photo"
								data-photo
								data-tilt={tilts[index % tilts.length]}
								style="--tilt: {tilts[index % tilts.length]}deg"
								{...imageProps(stat.image.src, { sizes: '(min-width: 768px) 320px, 100vw' })}
								alt={stat.image.alt ?? ''}
								loading="lazy"
							/>
						{/if}
					{/each}
				</div>
			{:else if image?.src}
				<img
					class="image"
					{...imageProps(image.src, { sizes: '(min-width: 768px) 320px, 100vw' })}
					alt={image.alt ?? ''}
					loading="lazy"
				/>
			{/if}
		</div>

		<ul class="stats">
			{#each stats as { digit, prefix, suffix, label, comma }, index (index)}
				<li class="stat" data-stat>
					<Counter
						{digit}
						{prefix}
						{suffix}
						{label}
						{comma}
						once={!repeat && !live}
						active={!live || index < revealed}
					/>
				</li>
			{/each}
		</ul>
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
		display: grid;
		grid-template-columns: 1fr;
		gap: 48px;
		align-items: start;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);

		@include mixins.max-md {
			padding-block: 96px;
		}

		@include mixins.min-md {
			grid-template-columns: 1fr 1fr;
			gap: 64px;
		}
	}

	.copy {
		display: flex;
		flex-direction: column;
		gap: 32px;
		max-width: 320px;
	}

	.image {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius);
		object-fit: cover;

		@include mixins.max-md {
			aspect-ratio: 4 / 3;
		}
	}

	.pinned {
		overflow-x: clip;
	}

	// Pictures pile in one box; each is tilted a little, and the last one in sits on top.
	.stack {
		position: relative;
		aspect-ratio: 3 / 4;

		@include mixins.min-md {
			margin-top: 24px;
		}

		@include mixins.max-md {
			aspect-ratio: 4 / 3;
		}
	}

	.photo {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border-radius: var(--radius);
		box-shadow: 0 16px 40px rgb(0 0 0 / 0.35);
		object-fit: cover;
		rotate: var(--tilt);
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 48px 24px;
		margin: 0;
		padding: 0;
		list-style: none;

		@include mixins.min-md {
			gap: 64px 32px;
		}
	}

	// The counter's own number is a smaller heading and centered; here it takes the H1 look and sits at the start.
	.stat :global(.counter) {
		align-items: flex-start;
	}

	.stats .stat :global(.counter .value) {
		@include mixins.h1;

		justify-content: flex-start;
		width: auto;
	}

	.stats .stat :global(.counter .label) {
		color: var(--color-text-muted);
	}
</style>
