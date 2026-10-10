<script module lang="ts">
	import type {
		AccordionTableItem,
		AccordionTableProps
	} from '$lib/components/accordion-table.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type AccordionTableSectionItem = AccordionTableItem & {
		/** A video the row's button opens in the Video Overlay. The button's text is the row's `cta.text`. */
		video?: { src: string; title?: string; poster?: string };
	};

	export type AccordionTableSectionProps = Omit<SectionCopyProps, 'level' | 'layout'> &
		Pick<AccordionTableProps, 'columns'> & {
			items: AccordionTableSectionItem[];
			/** Props of the Accordion Table: `icon`, `singleOpen`, `defaultOpen`, `sticky`, `striped`, `contentColumn`, `slidesPerView` and `loopImages`. */
			table?: Omit<AccordionTableProps, 'columns' | 'items'>;
			/** At least the height of the screen, with the content centered. Taller content still grows past it. */
			fullScreen?: boolean;
			id?: string;
			class?: string;
		};
</script>

<script lang="ts">
	import AccordionTable from '$lib/components/accordion-table.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import VideoOverlay from '$lib/components/video-overlay.svelte';

	let {
		columns,
		items,
		table,
		fullScreen = false,
		id,
		class: className,
		...copy
	}: AccordionTableSectionProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));

	let playing = $state<number>();
	let open = $state(false);

	const video = $derived(playing === undefined ? undefined : items[playing]?.video);
	const rows = $derived(
		items.map((item, index) =>
			item.video?.src
				? {
						...item,
						cta: {
							...item.cta,
							text: item.cta?.text || 'Play video',
							url: undefined,
							onclick: () => {
								playing = index;
								open = true;
							}
						}
					}
				: item
		)
	);
</script>

<section {id} class="accordion-table-section {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		{#if hasCopy}
			<header class="header">
				<SectionCopy level={2} layout="row" {...copy} />
			</header>
		{/if}

		<AccordionTable {columns} items={rows} icon="chevron-down" contentColumn={3} {...table} />
	</div>
</section>

<VideoOverlay
	bind:open
	src={video?.src ?? ''}
	title={video?.title ?? 'Video'}
	poster={video?.poster || undefined}
/>

<style lang="scss">
	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);
	}

	.header {
		margin-block-end: var(--body-padding);
	}
</style>
