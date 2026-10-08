<script lang="ts">
	import circleHighlight from '$lib/content/page_platform/circle-highlight.json';
	import headline from '$lib/content/page_platform/headline.json';
	import hero from '$lib/content/page_platform/hero-image-circle.json';
	import CircleHighlight from '$lib/sections/circle-highlight.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};
</script>

<HeroImageCircle id="hero" {...hero} {cta} direction="left" offset={2} />
<Headline id="headline" {...headline} />
<CircleHighlight id="circle-highlight" {...circleHighlight} orientation="tilted-left" />
