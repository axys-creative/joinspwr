<script module lang="ts">
	import type { MarqueeImage } from '$lib/components/marquee.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type FinanceStickyProps = Omit<SectionCopyProps, 'level' | 'layout' | 'align'> & {
		/** The logos, two across, each fading in as it scrolls into view. */
		logos: MarqueeImage[];
		/** Label of the search box that follows the section, such as "Search dealer network". Leave empty for no search. */
		searchLabel?: string;
		/** The search box shows only with at least this many logos. Defaults to `12`. */
		searchMinimum?: number;
		/** A short heading above the search box, such as "Find your dealer". */
		searchTitle?: string;
		/** Which side the pinned copy sits on from `lg` up. */
		side?: 'left' | 'right';
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import LogoSearch from '$lib/components/logo-search.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { animate } from '$lib/attachments/animate';
	import { gradientBorder } from '$lib/attachments/gradient-border';

	let {
		logos,
		searchLabel,
		searchMinimum = 12,
		searchTitle,
		side = 'left',
		fullScreen = false,
		id,
		class: className,
		title,
		eyebrowText,
		eyebrowIcon,
		eyebrowImage,
		description,
		cta
	}: FinanceStickyProps = $props();

	let list = $state<HTMLElement>();
	let copy = $state<HTMLElement>();
	let matches = $state<Set<number> | null>(null);
	let viewport = $state(0);
	let pinHeight = $state(0);
</script>

<svelte:window bind:innerHeight={viewport} />

<section
	{id}
	class="finance-sticky {className ?? ''}"
	class:full-screen={fullScreen}
	class:right={side === 'right'}
>
	<div class="inner">
		<div class="copy" bind:this={copy}>
			<div
				class="pin"
				bind:clientHeight={pinHeight}
				style:--pin-top="{Math.max(0, (viewport - pinHeight) / 2)}px"
			>
				<SectionCopy
					level={2}
					{eyebrowText}
					{eyebrowIcon}
					{eyebrowImage}
					{title}
					{description}
					{cta}
				/>
			</div>
		</div>

		<ul class="logos" bind:this={list}>
			{#each logos as logo, index (index)}
				<li
					{@attach animate({ variant: 'up', delay: (index % 2) * 0.12 })}
					{@attach gradientBorder({ rayTrace: 'border', rayReach: 180 })}
				>
					<img
						src={logo.src}
						alt={logo.alt ?? ''}
						loading="lazy"
						class:match={matches?.has(index)}
						class:dim={matches && !matches.has(index)}
					/>
				</li>
			{/each}
		</ul>
	</div>
</section>

{#if searchLabel && logos.length >= searchMinimum}
	<LogoSearch
		grid={list}
		alignTo={copy}
		title={searchTitle}
		label={searchLabel}
		names={logos.map((logo) => logo.alt ?? '')}
		bind:matches
	/>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: grid;
		gap: 48px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: 96px;

		@include mixins.min-lg {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--body-padding);
			padding-block: 0 25svh;
		}
	}

	.pin {
		@include mixins.min-lg {
			position: sticky;
			top: var(--pin-top, 0);
			margin-top: 25svh;
		}
	}

	.right .copy {
		@include mixins.min-lg {
			order: 2;
		}
	}

	.logos {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
		margin: 0;
		padding: 0;
		list-style: none;

		@include mixins.min-lg {
			margin-top: 25svh;
		}

		@include mixins.max-md {
			gap: 16px;
		}
	}

	li {
		--gradient-ray-size: 90px;

		aspect-ratio: 3 / 2;
		border-radius: 16px;

		// The ring follows the logo's search dim and highlight.
		&:global(.gradient-border)::before {
			@include mixins.mq-motion-allow {
				transition:
					opacity 0.3s var(--ease),
					scale 0.3s var(--ease);
			}
		}

		&:has(.dim)::before {
			opacity: 0.2;
		}

		&:has(.match)::before {
			scale: 1.04;
		}
	}

	img {
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		padding: 32px;
		@include mixins.glass-card($blur: 0);

		object-fit: contain;

		@include mixins.mq-motion-allow {
			transition:
				opacity 0.3s var(--ease),
				scale 0.3s var(--ease);
		}

		&.dim {
			opacity: 0.2;
		}

		&.match {
			border-color: var(--color-accent);
			scale: 1.04;
		}

		@include mixins.max-md {
			padding: 16px;
		}
	}
</style>
