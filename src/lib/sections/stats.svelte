<script module lang="ts">
	import type { CounterProps } from '$lib/components/counter.svelte';

	export type StatItem = Pick<CounterProps, 'digit' | 'prefix' | 'suffix' | 'label' | 'comma'>;

	export type StatsProps = {
		/** Rich text: `[words]{.primary}` tokens add color, scribble and more, and `{.br}` breaks the line. */
		title?: string;
		/** A picture under the title. */
		image?: { src: string; alt?: string };
		/** Four fit the two by two grid; more continue in rows of two. */
		stats: StatItem[];
		/** Count up again each time the grid scrolls into view, instead of only the first time. */
		repeat?: boolean;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Counter from '$lib/components/counter.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { imageProps } from '$lib/utils/image';

	let {
		title,
		image,
		stats,
		repeat = false,
		fullScreen = false,
		id,
		class: className
	}: StatsProps = $props();
</script>

<section {id} class="stats-section {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<div class="copy">
			<SectionCopy level={2} {title} showEyebrow={false} showDescription={false} showCta={false} />

			{#if image?.src}
				<img
					class="image"
					{...imageProps(image.src, { sizes: '(min-width: 768px) 320px, 100vw' })}
					alt={image.alt ?? ''}
					loading="lazy"
				/>
			{/if}
		</div>

		<ul class="stats">
			{#each stats as { digit, prefix, suffix, label, comma }, index (index)}
				<li class="stat">
					<Counter {digit} {prefix} {suffix} {label} {comma} once={!repeat} />
				</li>
			{/each}
		</ul>
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
		display: grid;
		grid-template-columns: 1fr;
		gap: 48px;
		align-items: start;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);

		@include mixins.min-md {
			grid-template-columns: 1fr 1fr;
			gap: 64px;
		}
	}

	.copy {
		display: flex;
		flex-direction: column;
		gap: 32px;
		max-width: 320px;
	}

	.image {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius);
		object-fit: cover;

		@include mixins.max-md {
			aspect-ratio: 4 / 3;
		}
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 48px 24px;
		margin: 0;
		padding: 0;
		list-style: none;

		@include mixins.min-md {
			gap: 64px 32px;
		}
	}

	// The counter's own number is a smaller heading and centered; here it takes the H1 look and sits at the start.
	.stat :global(.counter) {
		align-items: flex-start;
	}

	.stats .stat :global(.counter .value) {
		@include mixins.h1;

		justify-content: flex-start;
		width: auto;
	}

	.stats .stat :global(.counter .label) {
		color: var(--color-text-muted);
	}
</style>
