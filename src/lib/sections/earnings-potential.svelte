<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type EarningsTab = {
		/** The tab's button text and the bar's label, such as `Year 1`. */
		label: string;
		/** The earnings this year stands for, in whole dollars. The chart is drawn from these. */
		amount: number;
		title: string;
		description: string;
	};

	export type EarningsPotentialProps = Pick<SectionCopyProps, 'title' | 'cta'> & {
		/** One per bar. The chart shows them in order, and the selected tab lights its bar and sets the big number. */
		tabs: EarningsTab[];
		/** The line above the big number. */
		chartLabel?: string;
		/** Small print under the chart, such as what the figures are based on. */
		note?: string;
		/** The tab that starts selected, counting from 0. */
		defaultTab?: number;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		/** The bars are already grown instead of rising as the section scrolls into view. For the CMS preview. */
		static?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { tabs as tabsAttachment } from '$lib/attachments/tabs';
	import { toggleSlider } from '$lib/attachments/toggle-slider';

	let {
		tabs,
		chartLabel = 'Average yearly earnings',
		note,
		defaultTab = 0,
		fullScreen = false,
		id,
		static: still = false,
		class: className,
		title,
		cta
	}: EarningsPotentialProps = $props();

	const money = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;
	const short = (value: number) => (value >= 1000 ? `$${Math.round(value / 1000)}K` : `$${value}`);

	let selected = $state(untrack(() => defaultTab));
	let armed = $state(false);
	let revealed = $state(false);
	let section = $state<HTMLElement>();

	// Three gridlines on a round number: 1, 2, 2.5 or 5 times a power of ten.
	const step = $derived.by(() => {
		const rough = Math.max(...tabs.map((tab) => tab.amount), 1) / 3;
		const power = 10 ** Math.floor(Math.log10(rough));
		const nice = [1, 2, 2.5, 5, 10].find((n) => n * power >= rough) ?? 10;
		return nice * power;
	});
	const ceiling = $derived(step * 3);
	const ticks = $derived([0, 1, 2, 3].map((n) => n * step));

	const value = new Tween(
		untrack(() => tabs[defaultTab]?.amount ?? 0),
		{
			duration: 700,
			easing: cubicOut
		}
	);
	$effect(() => {
		const target = tabs[selected]?.amount ?? 0;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		value.set(target, { duration: reduced ? 0 : 700 });
	});

	// Without script the bars just show; with it they start flat and rise once the chart is in view.
	onMount(() => {
		if (still || !section) return;
		armed = true;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				revealed = true;
				observer.disconnect();
			},
			{ threshold: 0.35 }
		);
		observer.observe(section);
		return () => observer.disconnect();
	});
</script>

<section
	{id}
	class="earnings-potential {className ?? ''}"
	class:full-screen={fullScreen}
	class:armed
	class:revealed
	bind:this={section}
>
	<div class="inner">
		<figure class="card">
			<figcaption class="head">
				<span class="caption">
					{chartLabel}
					{#key selected}<span class="period" aria-hidden="true">{tabs[selected]?.label}</span
						>{/key}
				</span>
				<span class="value" aria-hidden="true">{money(value.current)}</span>
			</figcaption>

			<div class="plot" aria-hidden="true">
				{#each ticks as tick (tick)}
					<div class="grid" style="--at: {(tick / ceiling) * 100}%">
						<span>{short(tick)}</span>
					</div>
				{/each}
				<div class="bars">
					{#each tabs as tab, index (index)}
						<div class="column" class:on={index === selected}>
							<span class="bar-value">{short(tab.amount)}</span>
							<span class="bar" style="--h: {(tab.amount / ceiling) * 100}%; --i: {index}"></span>
						</div>
					{/each}
				</div>
			</div>
			<div class="labels" aria-hidden="true">
				{#each tabs as tab, index (index)}
					<span class:on={index === selected}>{tab.label}</span>
				{/each}
			</div>

			<table class="visually-hidden">
				<caption>{chartLabel}</caption>
				<thead><tr><th scope="col">Period</th><th scope="col">Earnings</th></tr></thead>
				<tbody>
					{#each tabs as tab, index (index)}
						<tr><th scope="row">{tab.label}</th><td>{money(tab.amount)}</td></tr>
					{/each}
				</tbody>
			</table>

			{#if note}<p class="note">{note}</p>{/if}
		</figure>

		<div class="content">
			<div class="tabset" {@attach tabsAttachment({ defaultTab, onChange: (i) => (selected = i) })}>
				<div
					class="list"
					role="tablist"
					aria-label="Earnings by year"
					{@attach toggleSlider({ variant: 'solid' })}
				>
					{#each tabs as tab, index (index)}
						<button type="button" class="tab" role="tab" aria-selected="false">{tab.label}</button>
					{/each}
				</div>

				<SectionCopy
					level={2}
					{title}
					showEyebrow={false}
					showDescription={false}
					showCta={false}
				/>

				{#each tabs as tab, index (index)}
					<div class="panel" role="tabpanel" hidden={index !== defaultTab}>
						<h3 class="h4">{tab.title}</h3>
						<p>{tab.description}</p>
					</div>
				{/each}
			</div>

			{#if cta}
				<SectionCopy {cta} showEyebrow={false} showTitle={false} showDescription={false} />
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
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);

		@include mixins.min-lg {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 80px;
		}
	}

	// Below lg the copy and tabs lead, and the chart they drive follows.
	.card {
		order: 2;
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin: 0;
		padding: 32px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-surface);

		@include mixins.min-lg {
			order: 0;
		}

		@include mixins.max-md {
			padding: 24px 20px;
		}
	}

	.head {
		display: grid;
		gap: 4px;
	}

	.caption {
		color: var(--color-text-muted);
		font-size: 14px;
	}

	// The year is the one colored word in the line, and fades in when it changes.
	.period {
		margin-inline-start: 0.5em;
		color: var(--on-background-alt);

		@include mixins.mq-motion-allow {
			animation: fade-up 0.5s var(--ease) both;
		}
	}

	.value {
		font-family: var(--font-heading);
		font-size: clamp(40px, 5vw, 64px);
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	// Recessive: faint rules and small muted labels, so the bars carry the eye.
	.plot {
		position: relative;
		margin-top: 12px;
		height: 280px;
		padding-left: 48px;

		@include mixins.max-md {
			height: 220px;
			padding-left: 40px;
		}
	}

	.grid {
		position: absolute;
		right: 0;
		bottom: var(--at);
		left: 0;
		border-top: 1px solid var(--color-border);
		opacity: 0.5;

		span {
			position: absolute;
			bottom: 4px;
			left: 0;
			color: var(--color-text-muted);
			font-size: 12px;
			font-variant-numeric: tabular-nums;
		}
	}

	.bars {
		position: relative;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 16px;
		align-items: end;
		height: 100%;
		padding-inline: 8px;
	}

	.column {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		height: 100%;
	}

	.bar {
		width: min(100%, 56px);
		height: var(--h);
		border-radius: 6px 6px 0 0;
		background: color-mix(in srgb, var(--color-text) 22%, transparent);

		@include mixins.mq-motion-allow {
			transition:
				background-color 0.5s var(--ease),
				height 0.9s var(--ease) calc(var(--i) * 90ms);
		}
	}

	.on .bar {
		background: var(--color-accent);
	}

	.armed:not(.revealed) .bar {
		height: 0;
	}

	.bar-value {
		margin-bottom: 6px;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		opacity: 0;

		@include mixins.mq-motion-allow {
			transition: opacity 0.3s var(--ease);
		}
	}

	.on .bar-value,
	.column:hover .bar-value {
		opacity: 1;
	}

	.labels {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: 16px;
		padding-left: 48px;
		padding-inline-end: 0;
		color: var(--color-text-muted);
		font-size: 14px;
		text-align: center;

		@include mixins.max-md {
			padding-left: 40px;
		}

		.on {
			color: var(--color-text);
		}
	}

	.note {
		margin: 0;
		color: var(--color-text-muted);
		font-size: 12px;
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
	}

	// The small button size. The press scale from Toggle Slider is kept in the transition so it eases instead of snapping.
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

		@include mixins.mq-motion-allow {
			animation: fade-up 0.5s var(--ease) both;
		}

		p {
			color: var(--color-text-muted);
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			translate: 0 8px;
		}
	}
</style>
