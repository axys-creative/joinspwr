<script module lang="ts">
	import type { VideoPlayerProps } from '$lib/components/video-player.svelte';

	export type VideoSectionProps = SectionCopyProps & {
		/** The Video Player's props. */
		video: VideoPlayerProps;
		/** The section's anchor. Clicking a link to `#id` plays the video as the page scrolls here. */
		id?: string;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import SectionCopy, { type SectionCopyProps } from '$lib/components/section-copy.svelte';
	import VideoPlayer from '$lib/components/video-player.svelte';

	let {
		id,
		video,
		layout = 'row',
		fullScreen = false,
		class: className,
		...copy
	}: VideoSectionProps = $props();

	// Played inside the click, so the browser counts it as a user action and allows sound.
	const playOnLink: Attachment<HTMLElement> = (section) => {
		if (!id) return;
		const onClick = (event: MouseEvent) => {
			if (!(event.target as Element).closest(`a[href="#${id}"]`)) return;
			section
				.querySelector('video')
				?.play()
				.catch(() => {});
		};
		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
	};
</script>

<section
	{id}
	class="video-section {className ?? ''}"
	class:full-screen={fullScreen}
	{@attach playOnLink}
>
	<div class="inner">
		<SectionCopy {...copy} {layout} />
		<VideoPlayer {...video} />
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	// On a phone or tablet the section is three quarters of the screen, so the edges of the sections around it show.
	.video-section {
		@include mixins.max-lg {
			display: grid;
			align-items: center;
			min-height: 75lvh;
		}
	}

	.full-screen {
		display: grid;
		align-items: center;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: 48px;
		max-width: var(--content-width);
		margin-inline: auto;
		padding: var(--body-padding-double) var(--body-padding);

		// The video shrinks with the screen's width, so the room around it does too, and they keep their proportion.
		@include mixins.max-lg {
			padding-block: 25vw;
		}
	}
</style>
