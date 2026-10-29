<script lang="ts">
	import accordion from '$lib/content/page_platform/accordion-section.json';
	import circleHighlight from '$lib/content/page_platform/circle-highlight.json';
	import dealerGrid from '$lib/content/page_platform/dealer-grid.json';
	import financeGrid from '$lib/content/page_platform/finance-grid.json';
	import headline from '$lib/content/page_platform/headline.json';
	import tools from '$lib/content/page_platform/tools.json';
	import hero from '$lib/content/page_platform/hero-image-circle.json';
	import AccordionSection from '$lib/sections/accordion-section.svelte';
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

<HeroImageCircle id="hero" {...hero} {cta} direction="left" offset={12} />
<Headline id="headline" fullScreen {...headline} />
<CircleHighlight
	id="circle-highlight"
	{...circleHighlight}
	captionPlacement="cards"
	orientation="tilted-left"
/>
<Tools id="tools" {...tools} />
<FinanceGrid id="finance" {...financeGrid} />
<FinanceGrid id="dealers" {...dealerGrid} />
<AccordionSection id="faq" {...accordion} />

<style lang="scss">
	:global(#circle-highlight),
	:global(#tools),
	:global(#finance),
	:global(#dealers),
	:global(#faq) {
		margin-block: 128px;
	}
</style>
