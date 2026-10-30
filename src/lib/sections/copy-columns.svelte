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
	import { animate } from '$lib/attachments/animate';
	import { underline } from '$lib/attachments/underline';
	import Icon from '$lib/components/icon.svelte';

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

	// The words after a paragraph's bold "In short:" are italic, whatever the CMS text holds.
	const italicShort = (html: string) =>
		html.replace(
			/(<p>\s*<strong>\s*In short:?\s*<\/strong>)([\s\S]*?)(<\/p>)/gi,
			'$1<em>$2</em>$3'
		);

	// A table row that opens with a marker ("A. Identifiers") hangs it in the margin, so wrapped lines stay clear of it.
	const hangMarkers = (html: string) =>
		html.replace(
			/(<tr>\s*)<td>\s*([A-Za-z]|\d{1,2})([.)])\s+/g,
			'$1<td class="has-marker"><span class="marker">$2$3</span>'
		);

	const prepare = (html: string) => hangMarkers(italicShort(html));

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
				<summary>
					<Icon name="/uploads/icon-arrow-right.svg" class="arrow" />{tocTitle}
				</summary>
				{@render links()}
			</details>
		{/if}

		<div class="blocks" bind:this={blocks}>
			{#each items as item, index (index)}
				<article class="block" id={toc ? anchors[index] : undefined}>
					<span
						class="divider"
						aria-hidden="true"
						{@attach animate({ variant: 'line', duration: 1 })}
					></span>
					<h2 class="title">{item.title}</h2>
					<div class="copy" {@attach underline({ selector: 'a' })}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html prepare(item.content)}
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
			// Pinned, it keeps the same gap from the top and the bottom of the screen.
			--toc-gap: 120px;

			position: sticky;
			top: var(--toc-gap);
			max-height: calc(100lvh - var(--toc-gap) * 2);
			padding-block: 48px;
		}
	}

	.toc-list {
		--fade: 80px;

		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-width: thin;

		&.fade-top {
			mask-image: linear-gradient(to bottom, transparent, #000 var(--fade));
		}

		&.fade-bottom {
			mask-image: linear-gradient(to top, transparent, #000 var(--fade));
		}

		&.fade-top.fade-bottom {
			mask-image: linear-gradient(
				to bottom,
				transparent,
				#000 var(--fade),
				#000 calc(100% - var(--fade)),
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
		padding: 16px 0;
		border-block-start: 1px solid var(--color-border);

		@include mixins.min-lg {
			display: none;
		}

		summary {
			display: flex;
			align-items: center;
			gap: 8px;
			list-style: none;
			cursor: pointer;

			&::-webkit-details-marker {
				display: none;
			}

			// The arrow turns down when the list opens, like the triangle it replaces.
			:global(.arrow) {
				@include mixins.mq-motion-allow {
					transition: rotate var(--duration) var(--ease);
				}
			}
		}

		&[open] summary :global(.arrow) {
			rotate: 90deg;
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
		position: relative;
		padding-block: 48px;
		scroll-margin-top: 80px;
	}

	// The line between sections draws across when it scrolls into view.
	.divider {
		position: absolute;
		inset: 0 0 auto;
		height: 1px;
		background: var(--color-border);
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

		// The marker takes a fixed width and the cell's text starts after it, so every line lines up beside it.
		:global(td.has-marker) {
			padding-inline-start: 2.5ch;
			text-indent: -2.5ch;
		}

		:global(td.has-marker .marker) {
			display: inline-block;
			width: 2.5ch;
			text-indent: 0;
		}

		:global(a) {
			color: var(--color-text);
			font-family: inherit;
			text-decoration: underline;
			text-underline-offset: 0.2em;

			// The underline attachment animates `background-size`, so it stays in this list.
			@include mixins.mq-motion-allow {
				transition:
					color 0.5s var(--ease),
					background-size var(--duration) var(--ease);
			}

			&:hover {
				color: var(--color-accent-text);
			}
		}

		:global(a.underline-effect) {
			text-decoration: none;
		}
	}
</style>
