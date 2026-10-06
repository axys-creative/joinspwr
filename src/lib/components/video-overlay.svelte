<script lang="ts">
	import Button from './button.svelte';
	import VideoPlayer from './video-player.svelte';

	type Props = {
		open?: boolean;
		src: string;
		title?: string;
		poster?: string;
		captions?: string;
		captionsLang?: string;
	};

	const TEARDOWN_MS = 300;

	let {
		open = $bindable(false),
		src,
		title = 'Video',
		poster,
		captions,
		captionsLang = 'en'
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	let loaded = $state(false);
	let teardown: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			clearTimeout(teardown);
			loaded = true;
			dialog.showModal();
			document.dispatchEvent(new CustomEvent('top-layer-open'));
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	const onclose = () => {
		open = false;
		dialog?.querySelector('video')?.pause();
		teardown = setTimeout(() => (loaded = false), TEARDOWN_MS);
	};

	// The dialog fills the viewport, so a click on itself is a backdrop click.
	const onclick = (event: MouseEvent) => {
		if (event.target === dialog) dialog.close();
	};
</script>

<dialog
	bind:this={dialog}
	class="video-overlay"
	aria-label={title}
	data-lenis-prevent
	{onclose}
	{onclick}
>
	{#if loaded}
		<div class="player">
			<VideoPlayer
				{src}
				{poster}
				{captions}
				{captionsLang}
				{title}
				track="ticks"
				playButton={false}
				sideControls={{ side: 'left', volume: true, fullscreen: true }}
				autoplay
			/>
		</div>
	{/if}
	<Button
		iconStart="x-lg"
		textDescription="Close video"
		autofocus
		onclick={() => dialog?.close()}
	/>
</dialog>

<style lang="scss">
	@use 'base/mixins';

	.video-overlay {
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 24px;
		width: 100vw;
		max-width: 100vw;
		height: 100dvh;
		max-height: 100dvh;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
		opacity: 0;

		&[open] {
			display: flex;
			opacity: 1;

			@starting-style {
				opacity: 0;
			}
		}

		&::backdrop {
			background-color: color-mix(in srgb, var(--spwr-black) 0%, transparent);
		}

		&[open]::backdrop {
			background-color: color-mix(in srgb, var(--spwr-black) 92%, transparent);

			@starting-style {
				background-color: color-mix(in srgb, var(--spwr-black) 0%, transparent);
			}
		}

		@include mixins.mq-motion-allow {
			&,
			&::backdrop {
				transition:
					opacity 0.3s ease,
					background-color 0.3s ease,
					display 0.3s allow-discrete,
					overlay 0.3s allow-discrete;
			}
		}
	}

	.player {
		width: min(90vw, calc(80dvh * 16 / 9), var(--content-width));
	}
</style>
