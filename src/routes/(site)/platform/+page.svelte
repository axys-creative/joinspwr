<script lang="ts">
	import circleHighlight from '$lib/content/page_platform/circle-highlight.json';
	import financeGrid from '$lib/content/page_platform/finance-grid.json';
	import headline from '$lib/content/page_platform/headline.json';
	import tools from '$lib/content/page_platform/tools.json';
	import hero from '$lib/content/page_platform/hero-image-circle.json';
	import CircleHighlight from '$lib/sections/circle-highlight.svelte';
	import FinanceGrid from '$lib/sections/finance-grid.svelte';
	import Headline from '$lib/sections/headline.svelte';
	import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';
	import Tools from '$lib/sections/tools.svelte';

	const cta = {
		primary: hero.cta.primary,
		secondary: hero.cta.secondary.text ? hero.cta.secondary : undefined
	};
</script>

<HeroImageCircle id="hero" {...hero} {cta} direction="left" offset={2} />
<Headline id="headline" {...headline} />
<CircleHighlight
	id="circle-highlight"
	{...circleHighlight}
	captionPlacement="cards"
	orientation="tilted-left"
/>
<Tools id="tools" {...tools} />
<FinanceGrid id="finance" {...financeGrid} />
