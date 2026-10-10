<script module lang="ts">
	import type { ColumnImage, ImageColumnsProps } from '$lib/components/image-columns.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type PhotoColumnsProps = Omit<SectionCopyProps, 'level' | 'layout' | 'align'> &
		Pick<
			ImageColumnsProps,
			'columns' | 'columnsMd' | 'columnsSm' | 'startOffset' | 'gnomon' | 'cardAspect' | 'start'
		> & {
			/** `{ src, alt }` pictures, with an optional `caption`, `accent` and `background` per card; the season, year and background otherwise vary by position. */
			images: ColumnImage[];
		} & {
			/** At least the height of the screen, with the content centered. Taller content still grows past it. */
			fullScreen?: boolean;
			/** The section's anchor, so a link or the CMS preview can point to `#id`. */
			id?: string;
			class?: string;
		};
</script>

<script lang="ts">
	import ImageColumns from '$lib/components/image-columns.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
	const years = ['2024', '2025', '2026'];
	const backgrounds = ['var(--color-secondary)', 'var(--on-background-alt)'];

	// Varied but fixed, so the server and the browser draw the same labels.
	const pick = <T,>(list: T[], index: number, shift: number) =>
		list[(Math.imul(index + 1, 2654435761) >>> shift) % list.length];

	let {
		images,
		columns = [4, 5, 4, 5],
		columnsMd,
		columnsSm,
		startOffset = 64,
		cardAspect = '1 / 1.1',
		start = 'top top',
		gnomon = { depth: 12, length: 44, radius: 4, angle: 80, imageSize: 75 },
		fullScreen = false,
		id,
		class: className,
		...copy
	}: PhotoColumnsProps = $props();

	const total = (counts?: number[]) => (counts ?? []).reduce((sum, count) => sum + count, 0);
	// Enough cards for the widest layout; the smaller ones show only as many as their own counts.
	const slots = $derived(Math.max(total(columns), total(columnsMd), total(columnsSm)));
	const cards = $derived(
		Array.from({ length: slots }, (_, slot) => {
			const image = images[slot % images.length];
			return {
				...image,
				background: image.background ?? backgrounds[slot % backgrounds.length],
				caption: image.caption ?? pick(seasons, slot, 20),
				accent: image.accent ?? pick(years, slot, 14)
			};
		})
	);
</script>

<section {id} class="photo-columns {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy align="center" {...copy} />
		<ImageColumns
			class="gear"
			images={cards}
			{columns}
			{columnsMd}
			{columnsSm}
			{startOffset}
			{gnomon}
			{cardAspect}
			{start}
		/>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.photo-columns {
		overflow: clip;
	}

	.photo-columns :global(.gear) {
		--accent-color: var(--color-accent);
		--accent-size: clamp(32px, 4.5vw, 56px);
		--accent-top: 12px;
		--accent-left: 20px;
		--accent-rotate: -12deg;
	}

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
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);
	}
</style>
