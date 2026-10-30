<script lang="ts">
	import gallery from '$lib/content/page_about/gallery-horizontal.json';
	import headline from '$lib/content/page_about/headline.json';
	import oss from '$lib/content/page_about/oss.json';
	import stats from '$lib/content/page_about/stats.json';
	import timeline from '$lib/content/page_about/scroll-timeline.json';
	import hero from '$lib/content/page_about/hero-image-circle.json';
	import GalleryHorizontal from '$lib/sections/gallery-horizontal.svelte';
	import Oss from '$lib/sections/oss.svelte';
	import ScrollTimeline from '$lib/sections/scroll-timeline.svelte';
	import Stats from '$lib/sections/stats.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};
</script>

{#if !hero.hidden}
	<HeroImageCircle id="hero" {...hero} {cta} direction="left" offset={12} />
{/if}
{#if !headline.hidden}
	<Headline id="headline" fullScreen {...headline} />
{/if}
{#if !gallery.hidden}
	<GalleryHorizontal id="leadership" {...gallery} />
{/if}
{#if !timeline.hidden}
	<ScrollTimeline id="timeline" variant="circle" {...timeline} />
{/if}
{#if !stats.hidden}
	<Stats id="stats" {...stats} />
{/if}
{#if !oss.hidden}
	<Oss id="oss" {...oss} />
{/if}

<style lang="scss">
	:global(#leadership),
	:global(#timeline),
	:global(#stats),
	:global(#oss) {
		margin-block: 128px;
	}
</style>
