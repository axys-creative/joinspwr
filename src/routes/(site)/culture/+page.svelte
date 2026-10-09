<script lang="ts">
	import hero from '$lib/content/page_culture/hero-gnomon.json';
	import headline from '$lib/content/page_culture/headline.json';
	import photoColumns from '$lib/content/page_culture/photo-columns.json';
	import carousel from '$lib/content/page_culture/carousel-tunnel.json';
	import earnings from '$lib/content/page_culture/earnings-potential.json';
	import oss from '$lib/content/page_culture/oss.json';
	import HeroGnomon from '$lib/sections/hero-gnomon.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import CarouselTunnel from '$lib/sections/carousel-tunnel.svelte';
	import EarningsPotential from '$lib/sections/earnings-potential.svelte';
	import Oss from '$lib/sections/oss.svelte';
	import PhotoColumns from '$lib/sections/photo-columns.svelte';
</script>

<HeroGnomon {...hero} />
<PhotoColumns id="photos" {...photoColumns} />
<Headline id="headline" {...headline} />
<CarouselTunnel
	id="carousel"
	{...carousel}
	autoplay={{ interval: 2400, quickStart: true }}
	titleEffect="scale"
/>
<EarningsPotential id="earnings" {...earnings} />
<Oss id="oss" {...oss} />

<style lang="scss">
	@use 'base/mixins';

	@include mixins.max-md {
		:global(#photos),
		:global(#headline) {
			margin-block-start: 48px;
		}

		:global(#earnings) {
			margin-block-start: 96px;
		}

		:global(#oss) {
			margin-block-start: 96px;
		}
	}
</style>
