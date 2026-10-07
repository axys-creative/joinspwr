<script lang="ts">
	import { onMount } from 'svelte';
	import CarouselTunnel from '$lib/sections/carousel-tunnel.svelte';
	import FinanceMarquee from '$lib/sections/finance-marquee.svelte';
	import GalleryHorizontal from '$lib/sections/gallery-horizontal.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import Oss from '$lib/sections/oss.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';
	import VideoSection from '$lib/sections/video-section.svelte';
	import hero from '$lib/content/page_home/hero-image-circle.json';
	import carousel from '$lib/content/page_home/carousel-tunnel.json';
	import gallery from '$lib/content/page_home/gallery-horizontal.json';
	import financeMarquee from '$lib/content/page_home/finance-marquee.json';
	import oss from '$lib/content/page_home/oss.json';
	import headline from '$lib/content/page_home/headline.json';
	import videoSection from '$lib/content/page_home/video-section.json';
	import { hasIdentityToken, loadIdentity } from '$lib/utils/identity';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};

	// Netlify sends CMS invite and recovery links to the home page.
	onMount(() => {
		if (!hasIdentityToken()) return;
		loadIdentity().then((identity) => identity.on('login', () => location.assign('/admin/')));
	});
</script>

<HeroImageCircle id="hero" {...hero} {cta} direction="center" />
<VideoSection
	id="video"
	{...videoSection}
	video={{
		...videoSection.video,
		track: 'ticks',
		playButton: false,
		sideControls: { side: 'left', volume: true, fullscreen: true }
	}}
/>
<Headline id="headline" {...headline} />
<GalleryHorizontal id="gallery" {...gallery} />
<CarouselTunnel
	id="carousel"
	{...carousel}
	autoplay={{ interval: 2400, quickStart: true }}
	titleEffect="scale"
/>
<FinanceMarquee id="finance" {...financeMarquee} />
<Oss id="oss" {...oss} />
