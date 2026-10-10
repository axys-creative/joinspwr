<script lang="ts">
	import type { AccordionTableColumn } from '$lib/components/accordion-table.svelte';
	import history from '$lib/content/page_oss/accordion-table.json';
	import hero from '$lib/content/page_oss/hero-image-wave.json';
	import AccordionTableSection from '$lib/sections/accordion-table-section.svelte';
	import HeroImageWave from '$lib/sections/hero-image-wave.svelte';

	const columns = history.columns as AccordionTableColumn[];
	const override: { src: string; alt: string }[] = (hero as { images?: [] }).images ?? [];
	const latest = history.items[0];
	const heroImages = override.length ? override : (latest?.images ?? []);
	const derived = latest ? `Highlights from{.br}${latest.location} ${latest.year}` : undefined;
	const accent = hero.showAccent === false ? undefined : hero.accent?.trim() || derived;
	const { showAccent: _, ...heroProps } = hero;
</script>

<HeroImageWave {...heroProps} images={heroImages} {accent} />
<AccordionTableSection id="history" {...history} {columns} />
