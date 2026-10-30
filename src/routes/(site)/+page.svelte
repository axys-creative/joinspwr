<script lang="ts">
	import { onMount } from 'svelte';
	import ComparisonTable from '$lib/sections/comparison-table.svelte';
	import CarouselSpotlight from '$lib/sections/carousel-spotlight.svelte';
	import CareerTabs from '$lib/sections/career-tabs.svelte';
	import CarouselTunnel from '$lib/sections/carousel-tunnel.svelte';
	import EarningsPotential from '$lib/sections/earnings-potential.svelte';
	import FaqTabs, { type FaqGroup } from '$lib/sections/faq-tabs.svelte';
	import FinanceSticky from '$lib/sections/finance-sticky.svelte';
	import GalleryHorizontal from '$lib/sections/gallery-horizontal.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import Oss from '$lib/sections/oss.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';
	import Stats from '$lib/sections/stats.svelte';
	import ImageTabs from '$lib/sections/image-tabs.svelte';
	import Tools from '$lib/sections/tools.svelte';
	import VideoSection from '$lib/sections/video-section.svelte';
	import imageTabs from '$lib/content/page_home/image-tabs.json';
	import steps from '$lib/content/page_home/steps.json';
	import hero from '$lib/content/page_home/hero-image-circle.json';
	import careerTabs from '$lib/content/page_home/career-tabs.json';
	import comparisonTable from '$lib/content/page_home/comparison-table.json';
	import carouselSpotlight from '$lib/content/page_home/carousel-spotlight.json';
	import carousel from '$lib/content/page_home/carousel-tunnel.json';
	import earnings from '$lib/content/page_home/earnings-potential.json';
	import gallery from '$lib/content/page_home/gallery-horizontal.json';
	import dealerMarquee from '$lib/content/page_home/dealer-marquee.json';
	import financeMarquee from '$lib/content/page_home/finance-marquee.json';
	import faqTabs from '$lib/content/page_home/faq-tabs.json';
	import oss from '$lib/content/page_home/oss.json';
	import stats from '$lib/content/page_home/stats.json';
	import headline from '$lib/content/page_home/headline.json';
	import videoSection from '$lib/content/page_home/video-section.json';
	import { hasIdentityToken, loadIdentity } from '$lib/utils/identity';
	import { visitorPath } from '$lib/utils/visitor-path.svelte';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};

	// Netlify sends CMS invite and recovery links to the home page.
	onMount(() => {
		visitorPath.restore();
		if (!hasIdentityToken()) return;
		loadIdentity().then((identity) => identity.on('login', () => location.assign('/admin/')));
	});
</script>

{#if !hero.hidden}
	<HeroImageCircle id="hero" {...hero} {cta} direction="center" />
{/if}
{#if visitorPath.current === 'new'}
	{#if !steps.hidden}
		<Tools id="steps" {...steps} />
	{/if}
	{#if !imageTabs.hidden}
		<ImageTabs id="support" {...imageTabs} />
	{/if}
{/if}
{#if !videoSection.hidden}
	<VideoSection
		id="video"
		fullScreen
		{...videoSection}
		video={{
			...videoSection.video,
			track: 'ticks',
			playButton: false,
			sideControls: { side: 'left', volume: true, fullscreen: true }
		}}
	/>
{/if}
{#if !headline.hidden}
	<Headline id="headline" fullScreen {...headline} />
{/if}
{#if !stats.hidden}
	<Stats id="stats" {...stats} />
{/if}
{#if !earnings.hidden}
	<EarningsPotential id="earnings" fullScreen {...earnings} />
{/if}
{#if !careerTabs.hidden}
	<CareerTabs id="career" fullScreen {...careerTabs} />
{/if}
{#if !carouselSpotlight.hidden}
	<CarouselSpotlight id="competitions" fullScreen {...carouselSpotlight} />
{/if}
{#if !gallery.hidden}
	<GalleryHorizontal id="gallery" {...gallery} />
{/if}
{#if !carousel.hidden}
	<CarouselTunnel id="carousel" {...carousel} autoplay={{ interval: 2400, quickStart: true }} />
{/if}
{#if visitorPath.current !== 'new'}
	{#if !comparisonTable.hidden}
		<ComparisonTable id="comparison" {...comparisonTable} />
	{/if}
	{#if !dealerMarquee.hidden}
		<FinanceSticky id="dealers" {...dealerMarquee} side={dealerMarquee.side as 'left' | 'right'} />
	{/if}
	{#if !financeMarquee.hidden}
		<FinanceSticky
			id="finance"
			{...financeMarquee}
			side={financeMarquee.side as 'left' | 'right'}
		/>
	{/if}
{/if}
{#if !oss.hidden}
	<Oss id="oss" {...oss} />
{/if}
{#if !faqTabs.hidden}
	<FaqTabs
		id="faq"
		fullScreen
		path={visitorPath.current}
		{...faqTabs}
		groups={faqTabs.groups as FaqGroup[]}
	/>
{/if}

<style lang="scss">
	:global(#steps),
	:global(#support),
	:global(#carousel),
	:global(#stats),
	:global(#comparison),
	:global(#dealers),
	:global(#finance),
	:global(#oss) {
		margin-block: 128px;
	}
</style>
