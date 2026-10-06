<script module lang="ts">
	import type { FanImage, ImageFanProps } from '$lib/components/image-fan.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type OssProps = Omit<SectionCopyProps, 'level' | 'layout' | 'align'> & {
		/** The cards of the fan, tall pictures. */
		images: FanImage[];
		/** Image Fan settings, such as `arc`, `gap`, `itemWidth`, `stack` or `chop`. */
		fan?: Omit<ImageFanProps, 'images' | 'class'>;
		/** Handwritten text in the top right corner of the fan. Rich text, so `{.br}` breaks the line. */
		accent?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import ImageFan from '$lib/components/image-fan.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		images,
		fan = { arc: 40, gap: 0.75, itemWidth: 19, stack: 'pyramid', chop: 12, animateIn: true },
		accent,
		fullScreen = false,
		class: className,
		title,
		eyebrowText,
		eyebrowIcon,
		eyebrowImage,
		...rest
	}: OssProps = $props();
</script>

<section class="oss {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy
			level={2}
			align="center"
			{eyebrowText}
			{eyebrowIcon}
			{eyebrowImage}
			{title}
			showDescription={false}
			showCta={false}
		/>

		<div class="fan">
			<ImageFan {...fan} {images} />
			{#if accent}
				<span class="accent" aria-hidden="true"><RichText text={accent} /></span>
			{/if}
		</div>

		<SectionCopy align="center" {...rest} showEyebrow={false} showTitle={false} />
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
		align-items: center;
		gap: 48px;
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
	}

	// The accent sits in the empty corner above the fan's lower right end, so it never moves the fan.
	.fan {
		position: relative;
		width: min(880px, 100%);
	}

	.accent {
		position: absolute;
		top: 0;
		right: 0;
		color: var(--color-accent);
		font-family: var(--font-accent);
		font-size: clamp(32px, 4vw, 56px);
		line-height: 1;
		rotate: 12deg;
		white-space: nowrap;
		pointer-events: none;

		@include mixins.max-md {
			position: static;
			display: block;
			text-align: center;
		}
	}
</style>
