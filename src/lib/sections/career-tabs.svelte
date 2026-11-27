<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type CareerTab = {
		/** The toggle's button text, such as `Senior rep`. */
		label: string;
		/** The picture: wide when selected, a thin dimmed crop beside the others on desktop. */
		image?: { src: string; alt?: string };
		description?: string;
	};

	export type CareerTabsProps = Pick<SectionCopyProps, 'title'> & {
		tabs: CareerTab[];
		/** The tab that starts selected, counting from 0. */
		defaultTab?: number;
		/** `linear` keeps the tab order, so earlier pictures stack up on the left. `loop` always puts the selected one first and the rest after it, wrapping round. */
		order?: 'linear' | 'loop';
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { tabs as tabsAttachment } from '$lib/attachments/tabs';
	import { toggleSlider } from '$lib/attachments/toggle-slider';
	import { imageProps } from '$lib/utils/image';

	let {
		title,
		tabs,
		defaultTab = 0,
		order = 'linear',
		fullScreen = false,
		id,
		class: className
	}: CareerTabsProps = $props();

	let list = $state<HTMLElement>();
	let active = $state(untrack(() => defaultTab));

	const place = (index: number) => (index - active + tabs.length) % tabs.length;

	const choose = (index: number) =>
		list?.querySelectorAll<HTMLElement>('[role="tab"]')[index]?.click();
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

		<div
			class="tabset"
			{@attach tabsAttachment({ defaultTab, onChange: (index) => (active = index) })}
		>
			<div
				bind:this={list}
				class="list"
				role="tablist"
				aria-label={title}
				{@attach toggleSlider({ variant: 'solid' })}
			>
				{#each tabs as tab, index (index)}
					<button type="button" class="tab" role="tab" aria-selected="false">{tab.label}</button>
				{/each}
			</div>

			<div class="strip">
				{#each tabs as tab, index (index)}
					<div
						class="slice"
						class:active={index === active}
						style:order={order === 'loop' ? place(index) : undefined}
					>
						{#if tab.image?.src}
							<img
								{...imageProps(tab.image.src, { sizes: '(min-width: 1280px) 1200px, 100vw' })}
								alt={index === active ? (tab.image.alt ?? '') : ''}
								loading="lazy"
							/>
						{/if}
						{#if index !== active}
							<button
								type="button"
								class="expand"
								tabindex="-1"
								aria-hidden="true"
								onclick={() => choose(index)}
							></button>
						{/if}
					</div>
				{/each}
			</div>

			{#each tabs as tab, index (index)}
				<div class="panel" role="tabpanel" hidden={index !== defaultTab}>
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
		scrollbar-width: none;

		// Scrolling clips a ring on the border, so the narrow layout draws its border inside the padding edge, where the ring sits, instead of stacking a second line.
		@include mixins.max-md {
			overflow-x: auto;
			padding: 5px;
			border: 0;
			box-shadow: inset 0 0 0 1px var(--color-border);

			&:global(.gradient-border)::before {
				inset: 0;
			}
		}
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

	.strip {
		--sliver: 12px;
		--sliver-hover: 24px;

		container-type: inline-size;
		display: grid;
		gap: 4px;
		aspect-ratio: 4 / 3;

		@include mixins.min-md {
			display: flex;
			aspect-ratio: 21 / 9;
		}
	}

	.slice {
		position: relative;
		min-width: 0;
		overflow: hidden;
		@include mixins.glass-card($radius: var(--radius-lg), $blur: 0);

		@include mixins.min-md {
			flex: 0 0 var(--sliver);

			&.active {
				flex-grow: 1;
			}

			@include mixins.mq-motion-allow {
				transition:
					flex-grow 0.6s var(--ease),
					flex-basis 0.3s var(--ease),
					border-color var(--duration) var(--ease);
			}
		}

		@include mixins.max-md {
			&:not(.active) {
				display: none;
			}
		}

		img {
			position: absolute;
			top: 0;
			left: 50%;
			display: block;
			width: 100cqw;
			max-width: none;
			height: 100%;
			translate: -50% 0;
			object-fit: cover;

			@include mixins.mq-motion-allow {
				transition: filter var(--duration) var(--ease);
			}
		}

		&:not(.active) img {
			filter: brightness(0.5);
		}

		@include mixins.desktop-hover {
			&:not(.active):hover {
				flex-basis: var(--sliver-hover);
				border-color: var(--color-accent);

				img {
					filter: brightness(0.75);
				}
			}
		}
	}

	.expand {
		position: absolute;
		inset: 0;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			translate: 0 8px;
		}
	}
</style>
