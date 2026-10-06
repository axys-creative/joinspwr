<script module lang="ts">
	import type { MarqueeImage, MarqueeProps } from '$lib/components/marquee.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type FinanceMarqueeProps = Omit<SectionCopyProps, 'level' | 'layout' | 'align'> & {
		/** The logos repeated across both rows. */
		logos: MarqueeImage[];
		/** Marquee settings, such as `speed`, `scrub`, `reverse` or `pauseOnHover`. */
		marquee?: Omit<MarqueeProps, 'images' | 'rows' | 'class'>;
		/** Handwritten text at the bottom left of the marquee. Rich text, so `{.br}` breaks the line. */
		accent?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import Marquee from '$lib/components/marquee.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		logos,
		marquee = { speed: 40, scrub: 0.5 },
		accent,
		fullScreen = false,
		class: className,
		title,
		eyebrowText,
		eyebrowIcon,
		eyebrowImage,
		description,
		cta
	}: FinanceMarqueeProps = $props();
</script>

<section class="finance-marquee {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<div class="copy">
			<SectionCopy
				level={2}
				align="center"
				{eyebrowText}
				{eyebrowIcon}
				{eyebrowImage}
				{title}
				{description}
				showCta={false}
			/>
		</div>

		<div class="marquees">
			<div class="logos">
				<Marquee label="Logos" {...marquee} images={logos} rows={2} class="logos-marquee" />
			</div>
			{#if accent}
				<span class="accent" aria-hidden="true"><RichText text={accent} /></span>
			{/if}
		</div>

		{#if cta}
			<div class="copy">
				<SectionCopy
					align="center"
					{cta}
					showEyebrow={false}
					showTitle={false}
					showDescription={false}
				/>
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: 48px;
		padding-block: var(--body-padding-double);
	}

	.copy {
		display: flex;
		justify-content: center;
		max-width: var(--content-width);
		margin-inline: auto;
		padding-inline: var(--body-padding);
	}

	.marquees {
		position: relative;
	}

	.accent {
		position: absolute;
		bottom: 0;
		left: var(--body-padding);
		z-index: 1;
		translate: 0 150%;
		color: var(--color-accent);
		font-family: var(--font-accent);
		font-size: clamp(32px, 4vw, 56px);
		line-height: 0.75;
		rotate: 6deg;
		white-space: nowrap;
		pointer-events: none;

		@include mixins.max-md {
			position: static;
			display: block;
			margin-top: 24px;
			text-align: center;
			translate: none;
		}
	}

	.logos {
		mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
	}

	.logos :global(.marquee.logos-marquee) {
		--gap: 24px;
		--image-height: 180px;
		--logo-width: 320px;

		@include mixins.max-md {
			--gap: 16px;
			--image-height: 72px;
			--logo-width: 168px;
		}
	}

	.logos :global(.marquee.logos-marquee img) {
		box-sizing: border-box;
		width: var(--logo-width);
		padding: 56px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--spwr-royal-light);
		object-fit: contain;

		@include mixins.max-md {
			padding: 20px 28px;
		}
	}
</style>
