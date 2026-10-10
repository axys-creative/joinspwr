<script module lang="ts">
	import type { CardGnomonProps } from '$lib/components/card-gnomon.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type GalleryGnomon = Pick<CardGnomonProps, 'depth' | 'length' | 'radius' | 'angle'>;

	export type GalleryImage = {
		src: string;
		alt?: string;
		/** Text in the notch along the bottom left of the card. */
		caption?: string;
		/** Plain text under the card, such as a job title. */
		role?: string;
		/** Overrides the section's `gnomon` settings for this card. */
		gnomon?: Partial<GalleryGnomon>;
	};

	export type GalleryGroup = {
		/** Up to four, placed in a collage: a tall one top left, a wide one under it, then the same again after the copy. */
		images: GalleryImage[];
		/** A short paragraph that sits between the two halves of the collage. */
		copy?: string;
	};

	export type GalleryHorizontalProps = Omit<SectionCopyProps, 'level'> & {
		groups: GalleryGroup[];
		/** Handwritten text before the first group. Rich text, so `{.br}` breaks the line. */
		accent?: string;
		/** Card Gnomon settings shared by every card. */
		gnomon?: GalleryGnomon;
		/** Overrides `gnomon` for the tall cards (the first and third in each group), whose notch needs less depth. */
		gnomonPortrait?: Partial<GalleryGnomon>;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** Every card is portrait: the second and fourth move right to make room for the taller shape. */
		portrait?: boolean;
		/** No pinned sideways slide and no entrance animation: the row scrolls on its own. For the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import CardGnomon from '$lib/components/card-gnomon.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { animate } from '$lib/attachments/animate';
	import { scrollSlide } from '$lib/attachments/scroll-slide';

	let {
		groups,
		accent,
		gnomon = { depth: 18, length: 48, radius: 4, angle: 85 },
		gnomonPortrait = { depth: 12 },
		portrait = false,
		id,
		static: still = false,
		class: className,
		...copy
	}: GalleryHorizontalProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
</script>

{#snippet card(image: GalleryImage | undefined, slot: number)}
	{#if image}
		<div class="slot slot-{slot}">
			<CardGnomon
				class="card"
				img={{ src: image.src, alt: image.alt }}
				{...{
					...gnomon,
					...(portrait || slot % 2 === 1 ? gnomonPortrait : {}),
					...(portrait ? { length: 'auto' as const } : {}),
					...image.gnomon
				}}
				cutouts={[{ from: 'bottom-left', text: image.caption ?? '' }]}
			/>
			{#if image.role}<p class="role">{image.role}</p>{/if}
		</div>
	{/if}
{/snippet}

<section {id} class="gallery-horizontal {className ?? ''}" class:portrait>
	{#if hasCopy}
		<header class="header">
			<SectionCopy level={2} {...copy} />
		</header>
	{/if}

	<div class="pin" {@attach still ? undefined : scrollSlide()}>
		<div class="container" data-slide-viewport>
			<div class="slider" data-slide-track>
				{#if accent}
					<span
						class="accent"
						aria-hidden="true"
						{@attach still ? undefined : animate({ variant: 'fade' })}
						><RichText text={accent} /></span
					>
				{/if}

				{#each groups as group, index (index)}
					<div class="group" {@attach still ? undefined : animate({ variant: 'up', stagger: 0.1 })}>
						{@render card(group.images[0], 1)}
						{@render card(group.images[1], 2)}
						{#if group.copy}<p class="copy">{group.copy}</p>{/if}
						{@render card(group.images[2], 3)}
						{@render card(group.images[3], 4)}
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	// Resize or reproportion the whole collage with these. Every offset below is derived from them, and the heights
	// follow the screen height so the collage fits inside the pinned box.
	.gallery-horizontal {
		--absolute-padding: 12px;
		--portrait-w: 216px;
		--portrait-h: clamp(260px, 30vh, 400px);
		--landscape-w: 280px;
		--landscape-h: clamp(180px, 21vh, 280px);
		--gap: 72px;
		--copy-w: 320px;

		position: relative;
		overflow-x: clip;
		padding-block: var(--body-padding-double);

		--pin-height: 80vh;

		@include mixins.max-lg {
			padding-inline: var(--body-padding);
		}
	}

	// Desktop cards, 10% larger; the pin grows with them so the taller collage still fits.
	.gallery-horizontal:not(.portrait) {
		@include mixins.min-lg {
			--portrait-w: 238px;
			--portrait-h: clamp(286px, 33vh, 440px);
			--landscape-w: 308px;
			--landscape-h: clamp(198px, 23.1vh, 308px);
			--pin-height: 88vh;
		}
	}

	// Every card is the portrait size, and the bottom cards shift right so they clear the ones above.
	.portrait {
		--portrait-w: 190px;
		--portrait-h: clamp(240px, 26vh, 360px);
		--landscape-w: var(--portrait-w);
		--landscape-h: var(--portrait-h);
		--role-space: 36px;

		.group {
			width: calc(var(--copy-left) + var(--portrait-w) * 1.25 + var(--landscape-w));
			height: calc(var(--portrait-h) * 2.25 + var(--gap) + var(--role-space));

			@include mixins.max-lg {
				width: 100%;
				height: auto;
			}
		}

		@include mixins.min-lg {
			.slider {
				gap: 56px;
			}

			.group :global(.slot-2) {
				left: calc(var(--portrait-w) * 1.25);
			}

			.group :global(.slot-4) {
				bottom: calc(var(--absolute-padding) + var(--role-space));
				left: calc(var(--copy-left) + var(--portrait-w) * 1.25);
			}
		}

		@include mixins.max-lg {
			.group {
				gap: 56px;
			}

			.group :global(.slot-2),
			.group :global(.slot-4) {
				width: 40%;
				aspect-ratio: 3 / 4;
			}
		}
	}

	.header {
		// The content column, so the title lines up with the header's logo and the page's other sections.
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		margin-block-end: var(--body-padding-double);

		@include mixins.max-lg {
			width: auto;
		}
	}

	.pin {
		position: relative;

		@include mixins.min-lg {
			height: var(--pin-height);
			min-height: 620px;
		}
	}

	.container {
		@include mixins.min-lg {
			display: flex;
			align-items: center;
			height: 100%;
			overflow-x: auto;
		}
	}

	.pin:global([data-sliding]) .container {
		overflow: hidden;
	}

	.slider {
		display: flex;
		align-items: flex-start;
		gap: 96px;
		// The first and last cards sit on the content column's edges, as wide as the screen allows.
		padding-inline: calc((100% - min(var(--content-width), 100% - var(--body-padding) * 2)) / 2);

		@include mixins.max-lg {
			flex-direction: column;
			align-items: stretch;
			gap: 64px;
			padding-inline: 0;
		}
	}

	.accent {
		flex-shrink: 0;
		align-self: center;
		color: var(--color-accent);
		font-family: var(--font-accent);
		font-size: clamp(32px, 4vw, 56px);
		line-height: 1;
		rotate: -16deg;
		white-space: nowrap;
		pointer-events: none;

		@include mixins.max-lg {
			rotate: 0;
			text-align: center;
			white-space: normal;
		}
	}

	.group {
		// Where the copy and the third image's column start, once images 1 and 2 have cleared.
		--copy-left: calc(var(--portrait-w) * 1.25 + var(--landscape-w) + var(--gap));

		position: relative;
		flex-shrink: 0;
		width: calc(var(--copy-left) + var(--portrait-w) * 0.75 + var(--landscape-w));
		height: calc(var(--portrait-h) * 1.5 + var(--gap) + var(--landscape-h));

		@include mixins.max-lg {
			display: flex;
			flex-direction: column;
			gap: 32px;
			width: 100%;
			height: auto;
		}
	}

	// The cards are placed here, but drawn by Card Gnomon.
	.group :global(.slot) {
		position: absolute;
	}

	.slot > :global(.card) {
		width: 100%;
		height: 100%;
	}

	.slot :global(.label) {
		justify-content: flex-start;
		padding-inline-start: 12px;
		text-align: start;
	}

	.role {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		margin: 10px 0 0;
		padding-inline-start: 12px;
		color: var(--color-text-muted);
		font-size: 14px;
		line-height: 1.2;
	}

	.group :global(.slot-1) {
		top: var(--absolute-padding);
		left: 0;
		width: var(--portrait-w);
		height: var(--portrait-h);
	}

	.group :global(.slot-2) {
		top: calc(var(--portrait-h) + var(--gap));
		left: calc(var(--portrait-w) * 0.5);
		width: var(--landscape-w);
		height: var(--landscape-h);
	}

	.group :global(.slot-3) {
		top: calc(var(--portrait-h) * 0.5);
		left: var(--copy-left);
		width: var(--portrait-w);
		height: var(--portrait-h);
	}

	.group :global(.slot-4) {
		bottom: var(--absolute-padding);
		left: calc(var(--copy-left) + var(--portrait-w) * 0.75);
		width: var(--landscape-w);
		height: var(--landscape-h);
	}

	@include mixins.max-lg {
		// Relative, not static: the card draws its picture with an absolutely placed layer that needs the card as its box.
		.group :global(.slot) {
			position: relative;
			inset: auto;
			width: 40%;
			height: auto;
		}

		.group :global(.slot-1),
		.group :global(.slot-3) {
			width: 40%;
			aspect-ratio: 3 / 4;
		}

		.group :global(.slot-2),
		.group :global(.slot-4) {
			width: 50%;
			aspect-ratio: 4 / 3;
		}

		.group :global(.slot-2) {
			align-self: center;
		}

		.group :global(.slot-4) {
			align-self: flex-end;
		}
	}

	.copy {
		position: absolute;
		top: var(--absolute-padding);
		left: var(--copy-left);
		width: var(--copy-w);
		margin: 0;
		color: var(--color-text-muted);

		@include mixins.max-lg {
			position: static;
			width: 100%;
		}
	}
</style>
