<!-- LIBRARY: DELETE ME. Documentation page; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import { watchScroll } from '$lib/attachments/watch-scroll';
	import { mouseTooltip } from '$lib/attachments/mouse-tooltip';
	import { alerts } from '$lib/utils/alerts.svelte';
	import Icon from '$lib/components/icon.svelte';
	import FormChoice from '$lib/components/form-choice.svelte';
	import LoaderBar from '$lib/components/loader-bar.svelte';
	import LoaderCounter from '$lib/components/loader-counter.svelte';
	import LoaderCurtain from '$lib/components/loader-curtain.svelte';
	import LoaderGrid from '$lib/components/loader-grid.svelte';
	import LoaderLogo from '$lib/components/loader-logo.svelte';
	import logo from '$lib/content/global/logo.json';
	import { loaderGridProps, loaderLogoProps, loaderProps } from '$lib/library/component-props';
	import { simulateLoad } from '$lib/library/simulate-load';
	import IntroFrame from '$lib/library/intro-frame.svelte';
	import LibrarySection from '$lib/library/library-section.svelte';
	import HeroSimple from '$lib/sections/hero-simple.svelte';
	import { navEntry } from '$lib/utils/nav';

	const nav = navEntry('/intros');
	let slow = $state(false);
	const announce = () =>
		alerts.show({
			type: 'info',
			title: slow ? 'Mimicking a slow connection' : 'Back to a default connection',
			message: slow
				? 'The loader demos now fake a 5 second load. Press play to see it.'
				: 'The loader demos are back to a 1.5 second load.',
			autoClose: 3000
		});
	const track = $derived(simulateLoad(slow ? 5000 : 1500));
</script>

<HeroSimple
	eyebrowText={nav.group}
	eyebrowIcon={nav.icon}
	title="Intros"
	description="Everything that plays when a page loads, not as it scrolls into view: loaders, the full-screen covers that show while the page arrives. Press play under a frame to see it again."
/>

<div class="intros page-grid">
	<!-- LIBRARY: DELETE ME. Picks how long the fake load in the loader demos takes. -->
	<div class="speed" onchange={announce} {@attach watchScroll({ idle: 1200 })}>
		<FormChoice type="switch" name="slow" label="Mimic slow connection" bind:checked={slow} />
		<button
			type="button"
			class="info"
			aria-label="About the mimic slow connection switch"
			{@attach mouseTooltip({
				message:
					'Fakes a slow connection in the loader demos, so the loader holds on its progress for longer. Replay a demo to see it.'
			})}
		>
			<Icon name="info-circle" />
		</button>
	</div>

	<LibrarySection
		title="Loader Bar"
		type="Intro"
		tag="Loader"
		description="A thin line that grows across the middle of the screen as the page loads, then fades. Progress is real on a site (the fonts and the pictures at the top of the page); the frame fakes a load. Mount it once in a layout, ahead of the page, and heroes with a load animation wait for it."
		props={loaderProps}
	>
		<IntroFrame path="/loader-bar">
			{#key track}
				<LoaderBar contained {track} />
			{/key}
		</IntroFrame>
	</LibrarySection>

	<LibrarySection
		title="Loader Counter"
		type="Intro"
		tag="Loader"
		description="A very large percentage in the bottom left that counts up to 100, then the whole screen slides away upward. Progress is real on a site (the fonts and the pictures at the top of the page); the frame fakes a load. Mount it once in a layout, ahead of the page, and heroes with a load animation wait for it."
		props={loaderProps}
	>
		<IntroFrame path="/loader-counter">
			{#key track}
				<LoaderCounter contained {track} />
			{/key}
		</IntroFrame>
	</LibrarySection>

	<LibrarySection
		title="Loader Curtain"
		type="Intro"
		tag="Loader"
		description="A percentage in the middle of two panels that part, up and down, when it reaches 100. Progress is real on a site (the fonts and the pictures at the top of the page); the frame fakes a load. Mount it once in a layout, ahead of the page, and heroes with a load animation wait for it."
		props={loaderProps}
	>
		<IntroFrame path="/loader-curtain">
			{#key track}
				<LoaderCurtain contained {track} />
			{/key}
		</IntroFrame>
	</LibrarySection>

	<LibrarySection
		title="Loader Grid"
		type="Intro"
		tag="Loader"
		description="A very large percentage in the bottom right that counts up to 100, over a screen of surface-colored tiles, the same grid as the Tiles page transition. When it reaches 100 the tiles fade away in a scattered wave from the top left, uncovering the page. Progress is real on a site (the fonts and the pictures at the top of the page); the frame fakes a load. Mount it once in a layout, ahead of the page, and heroes with a load animation wait for it."
		props={loaderGridProps}
	>
		<IntroFrame path="/loader-grid">
			{#key track}
				<LoaderGrid contained {track} />
			{/key}
		</IntroFrame>
	</LibrarySection>

	<LibrarySection
		title="Loader Logo"
		type="Intro"
		tag="Loader"
		description="The logo, faint at first, fills in from left to right as the page loads, then fades. Progress is real on a site (the fonts and the pictures at the top of the page); the frame fakes a load. Mount it once in a layout, ahead of the page, and heroes with a load animation wait for it."
		props={loaderLogoProps}
	>
		<IntroFrame path="/loader-logo">
			{#key track}
				<LoaderLogo {logo} contained {track} />
			{/key}
		</IntroFrame>
	</LibrarySection>
</div>

<style lang="scss">
	@use 'base/mixins';

	/* LIBRARY: DELETE ME */
	.speed {
		display: flex;
		align-items: center;
		gap: 12px;
		position: fixed;
		bottom: var(--body-padding);
		left: var(--body-padding);
		z-index: var(--z-header);
		padding: 12px 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-surface);

		// Resting, it tucks off the left edge and leaves the info icon showing.
		&:global([data-scroll-idle]):not(:hover, :focus-within) {
			translate: calc(-100% - var(--body-padding) + 52px) 0;
		}

		@include mixins.mq-motion-allow {
			transition: translate 0.5s var(--ease);
		}
	}

	.info {
		display: grid;
		place-items: center;
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-text-muted);
		font-size: 20px;
		cursor: help;

		&:hover,
		&:focus-visible {
			color: var(--color-text);
		}
	}

	.intros {
		row-gap: 96px;
		padding-block: 96px;
	}
</style>
