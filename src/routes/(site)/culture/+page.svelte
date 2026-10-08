<script lang="ts">
	import hero from '$lib/content/page_culture/hero-simple.json';
	import headline from '$lib/content/page_culture/headline.json';
	import photoColumns from '$lib/content/page_culture/photo-columns.json';
	import carousel from '$lib/content/page_culture/carousel-tunnel.json';
	import oss from '$lib/content/page_culture/oss.json';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import CarouselTunnel from '$lib/sections/carousel-tunnel.svelte';
	import Oss from '$lib/sections/oss.svelte';
	import PhotoColumns from '$lib/sections/photo-columns.svelte';
</script>

<HeroSimple {...hero} />
<Headline id="headline" {...headline} />
<PhotoColumns id="photos" {...photoColumns} />
<CarouselTunnel
	id="carousel"
	{...carousel}
	autoplay={{ interval: 2400, quickStart: true }}
	titleEffect="scale"
/>
<Oss id="oss" {...oss} />
