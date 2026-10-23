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

<HeroImageCircle id="hero" {...hero} {cta} direction="left" offset={12} />
<Headline id="headline" fullScreen {...headline} />
<GalleryHorizontal id="leadership" {...gallery} />
<ScrollTimeline id="timeline" variant="circle" {...timeline} />
<Stats id="stats" {...stats} />
<Oss id="oss" {...oss} />

<style lang="scss">
	:global(#leadership),
	:global(#timeline),
	:global(#stats),
	:global(#oss) {
		margin-block: 128px;
	}
</style>
