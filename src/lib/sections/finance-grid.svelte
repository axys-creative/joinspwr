<script module lang="ts">
	import type { MarqueeImage } from '$lib/components/marquee.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type FinanceGridLogo = MarqueeImage & {
		/** The partner's website, shown as a "Visit site" link on the tile. */
		url?: string;
		/** Opens the link in a new tab. */
		newTab?: boolean;
	};

	export type FinanceGridProps = Omit<SectionCopyProps, 'level' | 'layout' | 'align'> & {
		/** Every logo, laid out in rows that alternate four and three across. Tiles with a `url` show a "Visit site" link on hover. */
		logos: FinanceGridLogo[];
		/** Label of the search box that follows the section, such as "Search finance options". Leave empty for no search. */
		searchLabel?: string;
		/** The search box shows only with at least this many logos. Defaults to `12`. */
		searchMinimum?: number;
		/** A short heading above the search box, such as "Find your dealer". */
		searchTitle?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import LogoSearch from '$lib/components/logo-search.svelte';
	import LogoTile from '$lib/components/logo-tile.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	// Rows alternate four and three; a last row of three that would follow a four-row tapers to two, then one.
	function rowSizes(count: number) {
		const sizes: number[] = [];
		for (let left = count, width = 4; left > 0; width = width === 4 ? 3 : 4) {
			const size = Math.min(width, left);
			if (width === 4 && size === 3) sizes.push(2, 1);
			else sizes.push(size);
			left -= size;
		}
		return sizes;
	}

	// Each card spans two of eight tracks, so a row of n starts at track 5 - n.
	function startTracks(count: number) {
		return rowSizes(count).flatMap((size) =>
			Array.from({ length: size }, (_, index) => 5 - size + index * 2)
		);
	}

	let {
		logos,
		searchLabel,
		searchMinimum = 12,
		searchTitle,
		fullScreen = false,
		id,
		class: className,
		title,
		eyebrowText,
		eyebrowIcon,
		eyebrowImage,
		description,
		cta
	}: FinanceGridProps = $props();

	let list = $state<HTMLElement>();
	let matches = $state<Set<number> | null>(null);

	const starts = $derived(startTracks(logos.length));
</script>

<section {id} class="finance-grid {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<div class="copy">
			<SectionCopy
				level={2}
				align="center"
				{eyebrowText}
				{eyebrowIcon}
				{eyebrowImage}
				{title}
				{description}
				showCta={false}
			/>
		</div>

		<ul class="logos" bind:this={list}>
			{#each logos as logo, index (index)}
				<li style:--col={starts[index]}>
					<LogoTile
						src={logo.src}
						alt={logo.alt}
						url={logo.url}
						newTab={logo.newTab}
						match={matches?.has(index)}
						dim={!!matches && !matches.has(index)}
					/>
				</li>
			{/each}
		</ul>

		{#if cta}
			<div class="copy">
				<SectionCopy
					align="center"
					{cta}
					showEyebrow={false}
					showTitle={false}
					showDescription={false}
				/>
			</div>
		{/if}
	</div>
</section>

{#if searchLabel && logos.length >= searchMinimum}
	<LogoSearch
		grid={list}
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
		display: flex;
		flex-direction: column;
		gap: 48px;
		padding-block: var(--body-padding-double);
	}

	.copy {
		display: flex;
		justify-content: center;
		max-width: var(--content-width);
		margin-inline: auto;
		padding-inline: var(--body-padding);
	}

	// Eight tracks, two to a card: rows of four cards fill them, and a row of three sits on the tracks between,
	// so the rows alternate four and three across, tapering to two and one at the end when needed. The grid is the content width, like the header.
	.logos {
		--gap: 24px;

		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: var(--gap);
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin: 0;
		margin-inline: auto;
		padding: 0;
		list-style: none;

		@include mixins.max-md {
			--gap: 16px;

			grid-template-columns: repeat(2, 1fr);
			width: calc(100% - var(--body-padding) * 2);
		}

		@include mixins.min-md {
			li {
				grid-column: var(--col) / span 2;
			}
		}

		li {
			--tile-ratio: 16 / 9;
			--tile-padding: 24px;

			@include mixins.max-md {
				--tile-ratio: 3 / 2;
				--tile-padding: 12px;
			}
		}
	}
</style>
