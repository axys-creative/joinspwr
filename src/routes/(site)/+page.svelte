<script lang="ts">
	import { onMount } from 'svelte';
	import ComparisonTable from '$lib/sections/comparison-table.svelte';
	import CareerTabs from '$lib/sections/career-tabs.svelte';
	import CarouselTunnel from '$lib/sections/carousel-tunnel.svelte';
	import EarningsPotential from '$lib/sections/earnings-potential.svelte';
	import FinanceMarquee from '$lib/sections/finance-marquee.svelte';
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
	import carousel from '$lib/content/page_home/carousel-tunnel.json';
	import earnings from '$lib/content/page_home/earnings-potential.json';
	import gallery from '$lib/content/page_home/gallery-horizontal.json';
	import financeMarquee from '$lib/content/page_home/finance-marquee.json';
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

<HeroImageCircle id="hero" {...hero} {cta} direction="center" />
{#if visitorPath.current === 'new'}
	<Tools id="steps" {...steps} />
	<ImageTabs id="support" {...imageTabs} />
{/if}
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
<Headline id="headline" fullScreen {...headline} />
<EarningsPotential id="earnings" fullScreen {...earnings} />
<CareerTabs id="career" fullScreen {...careerTabs} />
<GalleryHorizontal id="gallery" {...gallery} />
<CarouselTunnel id="carousel" {...carousel} autoplay={{ interval: 2400, quickStart: true }} />
<Stats id="stats" {...stats} />
{#if visitorPath.current !== 'new'}
	<ComparisonTable id="comparison" {...comparisonTable} />
{/if}
<FinanceMarquee id="finance" {...financeMarquee} />
<Oss id="oss" {...oss} />
