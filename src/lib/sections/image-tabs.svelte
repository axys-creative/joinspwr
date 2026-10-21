<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ImageTab = {
		/** The toggle's button text, such as `Day 1`. */
		label: string;
		title?: string;
		description?: string;
		/** Shown beside the tabs while this tab is selected. Falls back to the section's `image`. */
		image?: { src: string; alt?: string };
	};

	export type ImageTabsProps = Pick<SectionCopyProps, 'title' | 'cta'> & {
		image: { src: string; alt?: string };
		tabs: ImageTab[];
		/** Moves to the next tab on its own. Defaults to `true`; off under reduced motion. */
		autoplay?: boolean;
		/** How long each tab stays selected, in milliseconds. Defaults to `2500`. */
		interval?: number;
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
	import { onMount, untrack } from 'svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { tabs as tabsAttachment } from '$lib/attachments/tabs';
	import { toggleSlider } from '$lib/attachments/toggle-slider';
	import { imageProps } from '$lib/utils/image';

	let {
		image,
		tabs,
		autoplay = true,
		interval = 2500,
		defaultTab = 0,
		fullScreen = false,
		id,
		class: className,
		title,
		cta
	}: ImageTabsProps = $props();

	let selected = $state(untrack(() => defaultTab));
	let section = $state<HTMLElement>();
	let tabButtons = $state<HTMLButtonElement[]>([]);
	let visible = $state(false);
	let hovering = $state(false);
	let focused = $state(false);
	let reduced = $state(true);

	const running = $derived(
		autoplay && !reduced && tabs.length > 1 && visible && !hovering && !focused
	);

	onMount(() => {
		const query = matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = query.matches);
		sync();
		query.addEventListener('change', sync);

		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		const enter = () => (hovering = true);
		const leave = () => (hovering = false);
		if (section) {
			observer.observe(section);
			section.addEventListener('pointerenter', enter);
			section.addEventListener('pointerleave', leave);
		}

		return () => {
			section?.removeEventListener('pointerenter', enter);
			section?.removeEventListener('pointerleave', leave);
			query.removeEventListener('change', sync);
			observer.disconnect();
		};
	});

	// Re-runs on every selection, so a manual pick restarts the wait.
	$effect(() => {
		if (!running) return;
		const next = (selected + 1) % tabs.length;
		const timer = setTimeout(() => tabButtons[next]?.click(), interval);
		return () => clearTimeout(timer);
	});
</script>

<section
	{id}
	class="image-tabs {className ?? ''}"
	class:full-screen={fullScreen}
	bind:this={section}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
>
	<div class="inner">
		<figure class="card">
			{#each tabs as tab, index (index)}
				{@const picture = tab.image?.src ? tab.image : image}
				<img
					class:current={index === selected}
					{...imageProps(picture.src, { sizes: '(min-width: 1024px) 50vw, 100vw' })}
					alt={index === selected ? (picture.alt ?? '') : ''}
					loading="lazy"
				/>
			{/each}
		</figure>

		<div class="content">
			<div class="tabset" {@attach tabsAttachment({ defaultTab, onChange: (i) => (selected = i) })}>
				<div class="heading">
					<SectionCopy
						level={2}
						{title}
						showEyebrow={false}
						showDescription={false}
						showCta={false}
					/>
				</div>

				<div
					class="list"
					role="tablist"
					aria-label={title}
					{@attach toggleSlider({ variant: 'solid' })}
				>
					{#each tabs as tab, index (index)}
						<button
							type="button"
							class="tab"
							role="tab"
							aria-selected="false"
							bind:this={tabButtons[index]}>{tab.label}</button
						>
					{/each}
				</div>

				{#each tabs as tab, index (index)}
					<div class="panel" role="tabpanel" hidden={index !== defaultTab}>
						{#if tab.title}<h3 class="h4">{tab.title}</h3>{/if}
						{#if tab.description}<p>{tab.description}</p>{/if}
					</div>
				{/each}
			</div>

			{#if cta}
				<div class="cta">
					<SectionCopy {cta} showEyebrow={false} showTitle={false} showDescription={false} />
				</div>
			{/if}
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
		display: grid;
		gap: 48px;
		align-items: start;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);

		@include mixins.min-lg {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 80px;
		}
	}

	.card {
		order: 2;
		margin: 0;
		position: relative;
		overflow: hidden;
		aspect-ratio: 4 / 3;
		@include mixins.glass-card($radius: var(--radius-lg), $blur: 0);

		@include mixins.min-lg {
			order: 0;
			aspect-ratio: 4 / 5;
		}

		img {
			position: absolute;
			inset: 0;
			display: block;
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0;

			@include mixins.mq-motion-allow {
				transition: opacity 0.6s var(--ease);
			}

			&.current {
				opacity: 1;
			}
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.tabset {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.list {
		--slider-color: var(--color-accent);

		align-self: flex-start;
		margin-block-end: 20px;
	}

	.tab {
		padding: var(--btn-padding-sm);
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-size: 13px;
		font-weight: var(--btn-font-weight);

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
		gap: 8px;
		min-height: 7.5em;

		&[hidden] {
			display: none;
		}

		h3,
		p {
			margin: 0;
		}

		p {
			color: var(--color-text-muted);
		}

		@include mixins.mq-motion-allow {
			animation: fade-up 0.5s var(--ease) both;
		}
	}

	// Below lg the pieces run in one column: title, the tabs, the image, the selected tab's text, then the button.
	@include mixins.max-lg {
		.inner {
			gap: 0;
		}

		.content,
		.tabset {
			display: contents;
		}

		.heading {
			order: 1;
			margin-block-end: 20px;
		}

		.list {
			order: 2;
			justify-self: start;
			margin-block-end: 16px;
		}

		.card {
			order: 3;
		}

		.panel {
			order: 4;
			margin-block-start: 24px;
		}

		.cta {
			order: 5;
			margin-block-start: 32px;
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			translate: 0 8px;
		}
	}
</style>
