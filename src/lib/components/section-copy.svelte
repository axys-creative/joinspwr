<script module lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import type CtaGroup from './cta-group.svelte';

	export type SectionCopyProps = {
		eyebrowText?: string;
		/** Icon name from `static/icons`. */
		eyebrowIcon?: string;
		/** A picture in the eyebrow, at its own proportions, such as a wide logo. */
		eyebrowImage?: { src: string; alt?: string };
		/** Rich text: `[words]{.primary}` tokens add color, scribble and more, and `{.br}` breaks the line. */
		title?: string;
		/** Heading level of the title. A page's hero is 1, other sections are 2. */
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		/** Looks like another heading size without changing the level. */
		titleStyle?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
		/** Rich text (the same tokens as `title`), or a snippet for content such as links. */
		description?: string | Snippet;
		cta?: ComponentProps<typeof CtaGroup>;
		/** `column` stacks everything; `row` puts the description beside the eyebrow and title. */
		layout?: 'column' | 'row';
		align?: 'start' | 'center';
		/** How the two sides line up in a row layout. */
		rowAlign?: 'start' | 'center' | 'end';
		showEyebrow?: boolean;
		showTitle?: boolean;
		showDescription?: boolean;
		showCta?: boolean;
	};
</script>

<script lang="ts">
	import Eyebrow from './eyebrow.svelte';
	import RichText from './rich-text.svelte';
	import CtaGroupComponent from './cta-group.svelte';

	let {
		eyebrowText,
		eyebrowIcon,
		eyebrowImage,
		title,
		level = 2,
		titleStyle,
		description,
		cta,
		layout = 'column',
		align = 'start',
		rowAlign = 'start',
		showEyebrow = true,
		showTitle = true,
		showDescription = true,
		showCta = true
	}: SectionCopyProps = $props();

	const hasEyebrow = $derived(showEyebrow && !!(eyebrowText || eyebrowIcon || eyebrowImage?.src));
	const hasTitle = $derived(showTitle && !!title);
	const hasDescription = $derived(showDescription && !!description);
	const hasCta = $derived(showCta && !!cta?.primary?.text);
</script>

{#if hasEyebrow || hasTitle || hasDescription || hasCta}
	<div class="section-copy" data-layout={layout} data-align={align} data-row-align={rowAlign}>
		{#if hasEyebrow || hasTitle}
			<div class="heading">
				{#if hasEyebrow}
					<Eyebrow text={eyebrowText} icon={eyebrowIcon} image={eyebrowImage} {align} />
				{/if}
				{#if hasTitle}
					<svelte:element this={`h${level}`} class={titleStyle}
						><RichText text={title} /></svelte:element
					>
				{/if}
			</div>
		{/if}

		{#if hasDescription || hasCta}
			<div class="body">
				{#if hasDescription}
					{#if typeof description === 'string'}
						<p class="description"><RichText text={description} /></p>
					{:else if description}
						<div class="description">{@render description()}</div>
					{/if}
				{/if}
				{#if hasCta && cta}
					<CtaGroupComponent
						{...cta}
						secondary={cta.secondary?.text ? cta.secondary : undefined}
						justify={align}
					/>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	@use 'base/mixins';

	// Spacing comes from the --space-* variables. Each group sets its own inner gap, so a piece that
	// is hidden leaves no stray space behind.
	.section-copy {
		display: flex;
		flex-direction: column;
		gap: var(--space-title-paragraph);
		width: 100%;
		max-width: var(--max-width-text);
	}

	.heading,
	.body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.heading {
		gap: var(--space-eyebrow-title);
	}

	.body {
		gap: var(--space-paragraph-cta-group);
	}

	.description {
		color: var(--color-text-muted);
		max-width: var(--max-width-description);
	}

	[data-align='center'] {
		align-items: center;
		margin-inline: auto;
		text-align: center;
		text-wrap: balance;

		.heading,
		.body {
			align-items: center;
		}
	}

	[data-align='start'] {
		align-items: flex-start;
	}

	[data-layout='row'] {
		max-width: none;

		@include mixins.min-md {
			flex-direction: row;
			justify-content: space-between;
			column-gap: var(--space-copy-columns);

			.heading,
			.body {
				flex: 1 1 0;
			}

			.body {
				max-width: var(--max-width-text);
			}

			&[data-row-align='start'] {
				align-items: flex-start;
			}

			&[data-row-align='center'] {
				align-items: center;
			}

			&[data-row-align='end'] {
				align-items: flex-end;
			}
		}
	}
</style>
