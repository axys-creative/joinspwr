<script lang="ts">
	import Icon from './icon.svelte';

	type Props = {
		text?: string;
		/** Icon name from `static/icons`. */
		icon?: string;
		/** A picture shown in place of the icon, at its own proportions, such as a wide logo. */
		image?: { src: string; alt?: string };
		/** Whether the image, icon and text line up at the start or the center. */
		align?: 'start' | 'center';
	};

	let { text, icon, image, align = 'start' }: Props = $props();
</script>

{#if icon || text || image?.src}
	<div class="eyebrow" class:center={align === 'center'}>
		{#if image?.src}
			<img class="eyebrow-image" src={image.src} alt={image.alt ?? ''} />
		{/if}
		{#if icon}
			<span class="eyebrow-icon"><Icon name={icon} /></span>
		{/if}
		{#if text}
			<span class="eyebrow-text">{text}</span>
		{/if}
	</div>
{/if}

<style lang="scss">
	.eyebrow {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		color: var(--color-accent-text);
	}

	.eyebrow.center {
		align-items: center;
	}

	.eyebrow-image {
		height: var(--eyebrow-image-height, 24px);
		width: auto;
		max-width: 100%;
	}

	.eyebrow-icon {
		display: inline-flex;
	}

	.eyebrow-text {
		font-family: var(--font-body);
		font-size: 14px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
