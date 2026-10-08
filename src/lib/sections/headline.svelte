<script module lang="ts">
	export type HeadlineProps = {
		/** The statement, which flips in word by word. Rich text: `[words]{.secondary-alt}` tokens add color, scribble and more. */
		text: string;
		eyebrowText?: string;
		/** Icon name from `static/icons`. Works without `eyebrowText` too. */
		eyebrowIcon?: string;
		/** With a `name` the headline is wrapped in quotes and credited beneath. */
		quote?: { name: string; role?: string; image?: { src: string; alt?: string } };
		/** At least the height of the screen, with the statement centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { imageProps } from '$lib/utils/image';
	import Eyebrow from '$lib/components/eyebrow.svelte';
	import RichText from '$lib/components/rich-text.svelte';
	import { textFlip } from '$lib/attachments/text-flip';

	let {
		text,
		eyebrowText,
		eyebrowIcon,
		quote,
		fullScreen = false,
		id,
		class: className
	}: HeadlineProps = $props();

	const quoted = $derived(!!quote?.name);
	const flip = textFlip({
		type: 'words',
		duration: 2.5,
		stagger: 0.1,
		ease: 'elastic.out(1.5, 0.3)'
	});
</script>

{#snippet statement()}
	<!-- A statement, not a section title, so it is a paragraph that looks like a heading. -->
	<p class="h2 text" {@attach flip}>
		{#if quoted}“{/if}<RichText {text} />{#if quoted}”{/if}
	</p>
{/snippet}

<section {id} class="headline {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<Eyebrow text={eyebrowText} icon={eyebrowIcon} align="center" />

		{#if quoted && quote}
			<figure class="quote">
				<blockquote>{@render statement()}</blockquote>
				<figcaption class="giver">
					{#if quote.image?.src}
						<img
							{...imageProps(quote.image.src, { sizes: '48px' })}
							alt={quote.image.alt ?? ''}
							width="48"
							height="48"
							loading="lazy"
						/>
					{/if}
					<span class="info">
						<span class="name">{quote.name}</span>
						{#if quote.role}<span class="role">{quote.role}</span>{/if}
					</span>
				</figcaption>
			</figure>
		{:else}
			{@render statement()}
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	// On a phone or tablet the section is half the screen, with the statement near the top: close to the video above, with the
	// room below it.
	.headline {
		@include mixins.max-lg {
			min-height: 50lvh;

			.inner {
				padding-block: 24px 96px;
			}
		}
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-eyebrow-title);
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);
		text-align: center;
	}

	.text {
		display: block;
		font-family: 'Antonio', var(--font-heading);
		font-size: clamp(30px, 8vw, 72px);
		max-width: 1000px;
		opacity: 1;
		text-wrap: balance;
	}

	.quote,
	blockquote {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
	}

	.quote {
		gap: 24px;
	}

	.giver {
		display: flex;
		align-items: center;
		gap: 12px;
		text-align: start;
	}

	img {
		--quote-img-size: 96px;
		flex: none;
		width: var(--quote-img-size);
		height: var(--quote-img-size);
		border-radius: var(--radius);
		object-fit: cover;
	}

	.info {
		display: flex;
		flex-direction: column;

		.name {
			@include mixins.body-large;
			text-transform: uppercase;
			color: var(--on-background-accent);
		}

		.role {
			@include mixins.body;
			text-transform: uppercase;
		}
	}
</style>
