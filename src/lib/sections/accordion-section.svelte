<script module lang="ts">
	import type { AccordionItem, AccordionProps } from '$lib/components/accordion.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type AccordionSectionProps = Omit<SectionCopyProps, 'level' | 'layout'> & {
		items: AccordionItem[];
		/** Props of the Accordion: `icon`, `plus`, `singleOpen`, `defaultOpen` and `toggleAll`. */
		accordion?: Omit<AccordionProps, 'items'>;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Accordion from '$lib/components/accordion.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		items,
		accordion,
		fullScreen = false,
		id,
		class: className,
		...copy
	}: AccordionSectionProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
</script>

<section {id} class="accordion-section {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		{#if hasCopy}
			<header class="header">
				<SectionCopy level={2} align="center" {...copy} />
			</header>
		{/if}

		<Accordion {items} icon="chevron-down" singleOpen {...accordion} />
	</div>
</section>

<style lang="scss">
	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		width: min(800px, 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);
	}

	.header {
		margin-block-end: var(--body-padding);
	}
</style>
