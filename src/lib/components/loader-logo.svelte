<script module lang="ts">
	export type LoaderLogoProps = LoaderOptions & {
		/** The word that rolls to the right while the page loads. Defaults to `SPWR`. */
		text?: string;
		/** On leaving, shrinks to the box that `choose-path.svelte` publishes and fades into it. Without that box it scales up and fades. */
		morph?: boolean;
	};
</script>

<script lang="ts">
	import { textRollLoop } from '$lib/attachments/text-roll-loop';
	import Loader, { type LoaderOptions } from '$lib/components/loader.svelte';

	let { text = 'SPWR', morph = false, class: className, ...options }: LoaderLogoProps = $props();

	let progress = $state(0);
	const roll = textRollLoop({
		direction: 'right',
		delay: 0,
		interval: 1.8,
		duration: 0.5,
		stagger: 0.08,
		until: () => progress >= 1
	});
</script>

<Loader
	hold={900}
	{...options}
	bind:progress
	exit={morph ? 1000 : 700}
	class="loader-logo {morph ? 'morph' : ''} {className ?? ''}"
>
	{#snippet children(value)}
		<div class="content">
			<p class="word" aria-hidden="true" {@attach roll}>{text}</p>
			<div class="ring" aria-hidden="true">
				<svg viewBox="0 0 100 100">
					<circle class="track" cx="50" cy="50" r="46" />
					<circle class="fill" cx="50" cy="50" r="46" pathLength="1" />
				</svg>
				<p class="percent">{Math.round(value * 100)}%</p>
			</div>
		</div>
	{/snippet}
</Loader>

<style lang="scss">
	@use 'base/mixins';

	:global(.loader-logo) {
		place-items: center;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
	}

	.word {
		margin: 0;
		font-family: var(--font-heading);
		font-size: clamp(56px, 12vw, 112px);
		font-weight: 700;
		line-height: 1.1;
	}

	.ring {
		position: relative;
		display: grid;
		place-items: center;
		width: 96px;
		aspect-ratio: 1;

		svg {
			grid-area: 1 / 1;
			width: 100%;
			height: 100%;
			rotate: -90deg;
			fill: none;
			stroke-width: 3;
			stroke-linecap: round;
		}
	}

	.track {
		stroke: var(--color-border);
	}

	.fill {
		stroke: var(--color-accent);
		stroke-dasharray: 1;
		stroke-dashoffset: calc(1 - var(--progress));
	}

	.percent {
		position: absolute;
		margin: 0;
		color: var(--color-text-muted);
		font-size: 14px;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.08em;
	}

	@include mixins.mq-motion-allow {
		:global(.loader-logo) {
			transition:
				opacity var(--exit) ease,
				scale var(--exit) var(--ease);
		}

		.content {
			transition: opacity 0.25s ease;
		}

		:global(.loader-logo.morph) {
			transition:
				top 0.7s cubic-bezier(0.7, 0, 0.2, 1),
				right 0.7s cubic-bezier(0.7, 0, 0.2, 1),
				bottom 0.7s cubic-bezier(0.7, 0, 0.2, 1),
				left 0.7s cubic-bezier(0.7, 0, 0.2, 1),
				border-radius 0.7s cubic-bezier(0.7, 0, 0.2, 1),
				opacity 0.3s ease 0.7s;
		}
	}

	:global(.loader-logo[data-phase='leaving']) {
		opacity: 0;
		scale: 1.04;
	}

	:global(.loader-logo.morph[data-phase='leaving']) {
		inset: var(--cp-top, 0px) var(--cp-right, 0px) var(--cp-bottom, 0px) var(--cp-left, 0px);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		scale: 1;
	}

	:global(.loader-logo[data-phase='leaving']) .content {
		opacity: 0;
	}
</style>
