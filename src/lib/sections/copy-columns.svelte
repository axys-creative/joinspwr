<script module lang="ts">
	export type CopyColumn = {
		title: string;
		/** Trusted HTML from the CMS: paragraphs, lists, sub-headings and links. */
		content: string;
	};

	export type CopyColumnsProps = {
		/** One block each: the title above its copy. */
		items: CopyColumn[];
		/** A table of contents of links to each block, pinned on the left from `lg` up and a collapsible list above it below. The blocks take the other 75%. */
		toc?: boolean;
		/** The table of contents heading. */
		tocTitle?: string;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let {
		items,
		toc = false,
		tocTitle = 'On this page',
		id,
		class: className
	}: CopyColumnsProps = $props();

	const uid = $props.id();
	const slug = (title: string, index: number) =>
		`${title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')}-${index + 1}`;
	const anchors = $derived(items.map((item, index) => slug(item.title, index)));

	let current = $state('');
	let blocks: HTMLElement;
	let list = $state<HTMLElement>();
	let fadeTop = $state(false);
	let fadeBottom = $state(false);

	// The fades show only on the sides that have more links to scroll to.
	const measure = () => {
		if (!list) return;
		fadeTop = list.scrollTop > 1;
		fadeBottom = list.scrollTop + list.clientHeight < list.scrollHeight - 1;
	};

	// Keeps the marked link in view when the list scrolls.
	$effect(() => {
		void current;
		const link = list?.querySelector<HTMLElement>('[aria-current]');
		if (!list || !link) return;
		if (
			link.offsetTop < list.scrollTop ||
			link.offsetTop + link.offsetHeight > list.scrollTop + list.clientHeight
		)
			list.scrollTo({ top: link.offsetTop - list.clientHeight / 2 });
	});

	$effect(() => {
		if (!list) return;
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(list);
		return () => observer.disconnect();
	});

	// The link of the block nearest the top of the screen is the one marked.
	onMount(() => {
		if (!toc) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const seen = entries.find((entry) => entry.isIntersecting);
				if (seen) current = seen.target.id;
			},
			{ rootMargin: '-15% 0px -75% 0px' }
		);
		blocks.querySelectorAll('.block').forEach((block) => observer.observe(block));
		return () => observer.disconnect();
	});
</script>

{#snippet links()}
	<ol class="links">
		{#each items as item, index (index)}
			<li>
				<a href="#{anchors[index]}" aria-current={current === anchors[index] ? 'true' : undefined}
					>{item.title}</a
				>
			</li>
		{/each}
	</ol>
{/snippet}

<section {id} class="copy-columns {className ?? ''}" class:has-toc={toc}>
	<div class="inner">
		{#if toc}
			<nav class="toc" aria-labelledby="{uid}-toc">
				<p class="toc-title" id="{uid}-toc">{tocTitle}</p>
				<div
					class="toc-list"
					class:fade-top={fadeTop}
					class:fade-bottom={fadeBottom}
					bind:this={list}
					onscroll={measure}
					data-lenis-prevent
				>
					{@render links()}
				</div>
			</nav>
			<details class="toc-small">
				<summary>{tocTitle}</summary>
				{@render links()}
			</details>
		{/if}

		<div class="blocks" bind:this={blocks}>
			{#each items as item, index (index)}
				<article class="block" id={toc ? anchors[index] : undefined}>
					<h2 class="title">{item.title}</h2>
					<div class="copy">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html item.content}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	.inner {
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block-end: var(--body-padding-double);
	}

	.has-toc .inner {
		@include mixins.min-lg {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
			gap: var(--body-padding);
			align-items: start;
		}
	}

	.toc {
		display: none;

		@include mixins.min-lg {
			display: flex;
			flex-direction: column;
			position: sticky;
			top: 120px;
			max-height: calc(75lvh - 120px);
			padding-block: 48px;
		}
	}

	.toc-list {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;

		&.fade-top {
			mask-image: linear-gradient(to bottom, transparent, #000 40px);
		}

		&.fade-bottom {
			mask-image: linear-gradient(to top, transparent, #000 40px);
		}

		&.fade-top.fade-bottom {
			mask-image: linear-gradient(
				to bottom,
				transparent,
				#000 40px,
				#000 calc(100% - 40px),
				transparent
			);
		}
	}

	.toc-title,
	.toc-small summary {
		color: var(--color-text);
		font-family: 'Antonio', var(--font-heading);
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.toc-title {
		margin-block-end: 16px;
	}

	.toc-small {
		margin-block-end: 24px;
		padding: 16px 0;
		border-block: 1px solid var(--color-border);

		@include mixins.min-lg {
			display: none;
		}

		summary {
			cursor: pointer;
		}

		.links {
			margin-block-start: 16px;
		}
	}

	.links {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		font-size: 0.9em;
		list-style: none;

		a {
			color: var(--color-text-muted);
			text-decoration: none;

			@include mixins.mq-motion-allow {
				transition: color var(--duration) var(--ease);
			}

			&:hover {
				color: var(--color-text);
			}

			&[aria-current] {
				color: var(--color-accent-text);
			}

			&:focus-visible {
				outline: 2px solid var(--color-accent-text);
				outline-offset: 2px;
			}
		}
	}

	.block {
		display: grid;
		gap: 24px;
		padding-block: 48px;
		border-top: 1px solid var(--color-border);
		scroll-margin-top: 80px;
	}

	.title {
		@include mixins.h4;
	}

	.copy {
		display: flex;
		flex-direction: column;
		gap: 1em;
		max-width: 70ch;
		color: var(--color-text-muted);

		:global(h3) {
			margin-block-start: 0.75em;
			color: var(--color-text);
			font-size: 1.1em;
		}

		:global(ul),
		:global(ol) {
			display: flex;
			flex-direction: column;
			gap: 0.5em;
			padding-inline-start: 1.25em;
		}

		:global(ul) {
			list-style: disc;
		}

		:global(ol) {
			list-style: decimal;
		}

		:global(table) {
			width: 100%;
			border-collapse: collapse;
			font-size: 0.9em;
		}

		:global(th),
		:global(td) {
			padding: 12px 16px 12px 0;
			border-bottom: 1px solid var(--color-border);
			text-align: left;
			vertical-align: top;
		}

		:global(th) {
			color: var(--color-text);
		}

		:global(a) {
			color: var(--color-text);
			font-family: inherit;
			text-decoration: underline;
			text-underline-offset: 0.2em;

			&:hover {
				color: var(--color-accent-text);
			}
		}
	}
</style>
