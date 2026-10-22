<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CareerTab = {
		/** The toggle's button text, such as `Senior rep`. */
		label: string;
		/** The wide picture under the toggle. */
		image?: { src: string; alt?: string };
		description?: string;
	};

	export type CareerTabsProps = Pick<SectionCopyProps, 'title'> & {
		tabs: CareerTab[];
		/** The tab that starts selected, counting from 0. */
		defaultTab?: number;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { tabs as tabsAttachment } from '$lib/attachments/tabs';
	import { toggleSlider } from '$lib/attachments/toggle-slider';
	import { imageProps } from '$lib/utils/image';

	let {
		title,
		tabs,
		defaultTab = 0,
		fullScreen = false,
		id,
		class: className
	}: CareerTabsProps = $props();
</script>

<section {id} class="career-tabs {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy
			level={2}
			align="center"
			{title}
			showEyebrow={false}
			showDescription={false}
			showCta={false}
		/>

		<div class="tabset" {@attach tabsAttachment({ defaultTab })}>
			<div
				class="list"
				role="tablist"
				aria-label={title}
				{@attach toggleSlider({ variant: 'solid' })}
			>
				{#each tabs as tab, index (index)}
					<button type="button" class="tab" role="tab" aria-selected="false">{tab.label}</button>
				{/each}
			</div>

			{#each tabs as tab, index (index)}
				<div class="panel" role="tabpanel" hidden={index !== defaultTab}>
					{#if tab.image?.src}
						<figure class="picture">
							<img
								{...imageProps(tab.image.src, { sizes: '(min-width: 1280px) 1200px, 100vw' })}
								alt={tab.image.alt ?? ''}
								loading="lazy"
							/>
						</figure>
					{/if}
					{#if tab.description}<p>{tab.description}</p>{/if}
				</div>
			{/each}
		</div>
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
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: 128px;

		@include mixins.min-lg {
			padding-block: var(--body-padding-double);
		}
	}

	.tabset {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.list {
		--slider-color: var(--color-accent);

		max-width: 100%;
		align-self: center;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tab {
		flex-shrink: 0;
		padding: var(--btn-padding-sm);
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-size: 13px;
		font-weight: var(--btn-font-weight);
		white-space: nowrap;

		@include mixins.mq-motion-allow {
			transition:
				opacity var(--duration) var(--ease),
				color var(--duration) var(--ease),
				scale 0.24s ease;
		}

		@include mixins.desktop-hover {
			opacity: 0.8;
		}

		&:global([data-active]) {
			color: var(--color-on-accent);
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 2px;
		}
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 32px;

		&[hidden] {
			display: none;
		}

		p {
			max-width: 60ch;
			margin: 0 auto;
			color: var(--color-text-muted);
			text-align: center;
		}

		@include mixins.mq-motion-allow {
			animation: fade-up 0.5s var(--ease) both;
		}
	}

	.picture {
		margin: 0;
		overflow: hidden;
		aspect-ratio: 21 / 9;
		@include mixins.glass-card($radius: var(--radius-lg), $blur: 0);

		@include mixins.max-md {
			aspect-ratio: 4 / 3;
		}

		img {
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			translate: 0 8px;
		}
	}
</style>
