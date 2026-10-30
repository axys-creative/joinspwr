<script lang="ts">
	import copy from '$lib/content/page_terms/copy-columns.json';
	import hero from '$lib/content/page_terms/hero-simple.json';
	import CopyColumns from '$lib/sections/copy-columns.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
</script>

{#if !hero.hidden}
	<HeroSimple {...hero} />
{/if}
{#if !copy.hidden}
	<CopyColumns id="terms" {...copy} />
{/if}
