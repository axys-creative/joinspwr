<script module lang="ts">
	export type LoaderLogoProps = LoaderOptions & {
		/** The logo that fills in as the page loads. */
		logo: LogoProps;
		/** On leaving, shrinks to the box that `choose-path.svelte` publishes and fades into it. Without that box it scales up and fades. */
		morph?: boolean;
	};
</script>

<script lang="ts">
	import Loader, { type LoaderOptions } from '$lib/components/loader.svelte';
	import Logo, { type LogoProps } from '$lib/components/logo.svelte';

	let { logo, morph = false, class: className, ...options }: LoaderLogoProps = $props();
</script>

<Loader
	{...options}
	exit={morph ? 1000 : 700}
	class="loader-logo {morph ? 'morph' : ''} {className ?? ''}"
>
	{#snippet children(progress)}
		<div class="content">
			<div class="mark" aria-hidden="true">
				<div class="layer ghost"><Logo {...logo} /></div>
				<div class="layer filled"><Logo {...logo} /></div>
			</div>
			<p class="percent" aria-hidden="true">{Math.round(progress * 100)}%</p>
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
		gap: 16px;
	}

	.mark {
		display: grid;
	}

	.layer {
		--logo-height: clamp(40px, 8vw, 72px);
		--logo-size: var(--logo-height);

		grid-area: 1 / 1;
	}

	.ghost {
		opacity: 0.15;
	}

	.filled {
		clip-path: inset(0 calc((1 - var(--progress)) * 100%) 0 0);
	}

	.percent {
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
