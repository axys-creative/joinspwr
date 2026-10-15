<script module lang="ts">
	import type { CarouselAccordionProps } from '$lib/components/carousel-accordion.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ToolsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'title' | 'description'
	> &
		Pick<CarouselAccordionProps, 'items' | 'interval' | 'autoplay' | 'striped'> & {
			/** At least the height of the screen, with the content centered. Taller content still grows past it. */
			fullScreen?: boolean;
			/** The section's anchor, so a link or the CMS preview can point to `#id`. */
			id?: string;
			class?: string;
		};
</script>

<script lang="ts">
	import CarouselAccordion from '$lib/components/carousel-accordion.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		items,
		interval,
		autoplay,
		striped = true,
		fullScreen = false,
		id,
		class: className,
		title,
		eyebrowText,
		eyebrowIcon,
		description
	}: ToolsProps = $props();
</script>

<section {id} class="tools {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy
			level={2}
			align="center"
			{eyebrowText}
			{eyebrowIcon}
			{title}
			{description}
			showCta={false}
		/>
		<CarouselAccordion {items} {interval} {autoplay} {striped} />
	</div>
</section>

<style lang="scss">
	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--body-padding);
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);
	}
</style>
