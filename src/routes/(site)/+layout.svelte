<script lang="ts">
	import '../../styles/styles.scss';
	import { bgDust } from '$lib/attachments/bg-dust';
	import AlertStack from '$lib/components/alert-stack.svelte';
	import FooterGnomon, { type FooterGnomonProps } from '$lib/components/footer-gnomon.svelte';
	import PageTransition from '$lib/components/page-transition.svelte';
	import ScrollProgress from '$lib/components/scroll-progress.svelte';
	import SmoothScroll from '$lib/components/smooth-scroll.svelte';
	import HeaderBasic, { type HeaderBasicProps } from '$lib/components/header-basic.svelte';
	import logo from '$lib/content/global/logo.json';
	import social from '$lib/content/global/social-media.json';
	import footerGnomon from '$lib/content/global/footer-gnomon.json';
	import headerBasic from '$lib/content/global/header-basic.json';
	import navigation from '$lib/content/global/navigation.json';

	let { children } = $props();
</script>

<svelte:body {@attach bgDust({ fixed: true })} />
<SmoothScroll />
<PageTransition name="fade" preserveHeader />

<div class="site">
	<HeaderBasic
		{...navigation as HeaderBasicProps}
		{...headerBasic as HeaderBasicProps}
		{logo}
		socialLinks={social.links}
	/>
	<main id="main" tabindex="-1">
		{@render children()}
	</main>
	<FooterGnomon {...footerGnomon as FooterGnomonProps} socialLinks={social.links} />
</div>

<ScrollProgress />
<AlertStack />

<style lang="scss">
	.site {
		display: flex;
		flex-direction: column;
		min-height: 100lvh;
	}

	main {
		flex: 1;

		&:focus {
			outline: none;
		}
	}
</style>
