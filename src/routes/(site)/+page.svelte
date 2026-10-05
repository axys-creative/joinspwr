<script lang="ts">
	import { onMount } from 'svelte';
	import Headline from '$lib/sections/headline.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';
	import VideoSection from '$lib/sections/video-section.svelte';
	import hero from '$lib/content/page_home/hero-image-circle.json';
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

<HeroImageCircle
	{...hero}
	{cta}
	direction="center"
	titleScribble={{ curve: 'zigzag', thickness: 0.12 }}
/>
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
<Headline {...headline} eyebrowDirection="column" />
