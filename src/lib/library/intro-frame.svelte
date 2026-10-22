<!-- LIBRARY: DELETE ME. Documentation only; remove with the rest of the library (see CLAUDE.md). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '$lib/components/button.svelte';

	let { path = '/mock-hero', children }: { path?: string; children: Snippet } = $props();

	let run = $state(0);
</script>

<div class="wrapper">
	<div class="frame">
		<div class="bar" aria-hidden="true">
			<span class="dots"><i></i><i></i><i></i></span>
			<span class="path">{path}</span>
		</div>

		<div class="stage">
			{#key run}
				{@render children()}
			{/key}
		</div>
	</div>

	<Button text="Play animation" type="outline" onclick={() => run++} />
</div>

<style lang="scss">
	/* LIBRARY: DELETE ME */
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	.frame {
		display: flex;
		flex-direction: column;
		width: min(max(80vw, 320px), calc(100vw - var(--body-padding) * 2));
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		background: var(--color-bg);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-surface);
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.dots {
		display: flex;
		gap: 6px;

		i {
			width: 9px;
			height: 9px;
			border-radius: 50%;
			background: var(--color-border);
		}
	}

	.path {
		color: var(--color-text-muted);
	}

	.stage {
		position: relative;
		display: grid;
		min-height: 480px;
		overflow: hidden;
		contain: paint;
	}
</style>
