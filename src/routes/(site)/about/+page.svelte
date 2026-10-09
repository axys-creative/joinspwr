<script lang="ts">
	import gallery from '$lib/content/page_about/gallery-horizontal.json';
	import headline from '$lib/content/page_about/headline.json';
	import oss from '$lib/content/page_about/oss.json';
	import timeline from '$lib/content/page_about/scroll-timeline.json';
	import hero from '$lib/content/page_about/hero-image-circle.json';
	import GalleryHorizontal from '$lib/sections/gallery-horizontal.svelte';
	import Oss from '$lib/sections/oss.svelte';
	import ScrollTimeline from '$lib/sections/scroll-timeline.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};
</script>

<HeroImageCircle id="hero" {...hero} {cta} direction="left" offset={2} />
<Headline id="headline" {...headline} />
<GalleryHorizontal id="leadership" {...gallery} />
<ScrollTimeline id="timeline" variant="circle" {...timeline} />
<Oss id="oss" {...oss} />
