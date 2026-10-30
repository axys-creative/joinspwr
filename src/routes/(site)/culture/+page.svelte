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

{#if !hero.hidden}
	<HeroGnomon {...hero} />
{/if}
{#if !photoColumns.hidden}
	<PhotoColumns id="photos" {...photoColumns} />
{/if}
{#if !headline.hidden}
	<Headline id="headline" fullScreen {...headline} />
{/if}
{#if !carousel.hidden}
	<CarouselTunnel id="carousel" {...carousel} autoplay={{ interval: 2400, quickStart: true }} />
{/if}
{#if !earnings.hidden}
	<EarningsPotential id="earnings" {...earnings} />
{/if}
{#if !oss.hidden}
	<Oss id="oss" {...oss} />
{/if}

<style lang="scss">
	@use 'base/mixins';

	:global(#photos) {
		margin-block-start: 240px;
	}

	:global(#headline) {
		padding-block: 96px 192px;
	}

	:global(#carousel),
	:global(#earnings),
	:global(#oss) {
		margin-block: 128px;
	}

	@include mixins.max-md {
		:global(#photos) {
			margin-block-start: 192px;
		}

		:global(#headline) {
			margin-block-start: 48px;
		}
	}
</style>
