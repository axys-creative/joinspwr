<script module lang="ts">
	export type ChoosePathOption = {
		text: string;
		/** Shows that path's sections on the home page. */
		path?: VisitorPath;
		/** Without a path or a URL the option just closes the modal. */
		url?: string;
		newTab?: boolean;
		image?: { src: string; alt?: string };
	};

	export type ChoosePathProps = {
		enabled?: boolean;
		/** Shows the modal in place, not over the page, and its buttons do nothing. For the CMS preview. */
		static?: boolean;
		title: string;
		options: ChoosePathOption[];
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { tilt } from '$lib/attachments/tilt';
	import { imageProps } from '$lib/utils/image';
	import { visitorPath, type VisitorPath } from '$lib/utils/visitor-path.svelte';
	import Button from './button.svelte';
	import Icon from './icon.svelte';

	let { enabled = true, static: inline = false, title, options }: ChoosePathProps = $props();

	const tiltOptions = { max: 8, scale: 1.02, glare: true, maxGlare: 0.25 };

	let dialog = $state<HTMLDialogElement>();

	onMount(() => {
		if (!enabled || !dialog) return;
		if (inline) return dialog.show();
		dialog.showModal();
		document.dispatchEvent(new CustomEvent('top-layer-open'));
	});

	const choose = (option: ChoosePathOption) => {
		if (inline) return;
		if (option.path) visitorPath.choose(option.path);
		dialog?.close();
	};

	// The dialog fills the viewport, so a click on itself is a backdrop click.
	const onclick = (event: MouseEvent) => {
		if (!inline && event.target === dialog) dialog.close();
	};
</script>

{#snippet card(option: ChoosePathOption)}
	{#if option.image}
		<img
			{...imageProps(option.image.src, { sizes: '(min-width: 768px) 300px, 80vw' })}
			alt={option.image.alt ?? ''}
			loading="lazy"
		/>
	{/if}
	<span class="label h3">
		{option.text}
		{#if option.url}
			<Icon name="arrow-tr" />
			{#if option.newTab}<span class="visually-hidden">(opens in a new tab)</span>{/if}
		{/if}
	</span>
{/snippet}

{#if enabled}
	<dialog
		bind:this={dialog}
		class="choose-path"
		class:inline
		aria-labelledby="choose-path-title"
		data-lenis-prevent
		{onclick}
	>
		<div class="panel">
			<Button
				class="close"
				type="text"
				iconStart="x-lg"
				textDescription="Close"
				onclick={() => !inline && dialog?.close()}
			/>
			<h2 id="choose-path-title">{title}</h2>
			<ul>
				{#each options as option (option.text)}
					<li>
						{#if option.url}
							<a
								class="option"
								href={option.url}
								target={option.newTab ? '_blank' : undefined}
								rel={option.newTab ? 'noopener noreferrer' : undefined}
								{@attach tilt(tiltOptions)}
							>
								{@render card(option)}
							</a>
						{:else}
							<button
								class="option"
								type="button"
								onclick={() => choose(option)}
								{@attach tilt(tiltOptions)}
							>
								{@render card(option)}
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</dialog>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.choose-path {
		align-items: center;
		justify-content: center;
		width: 100vw;
		max-width: 100vw;
		height: 100dvh;
		max-height: 100dvh;
		padding: var(--body-padding);
		border: 0;
		background: transparent;
		color: var(--color-text);
		opacity: 0;

		&[open] {
			display: flex;
			opacity: 1;

			@starting-style {
				opacity: 0;
			}
		}

		&::backdrop {
			@include mixins.glass;
			background: color-mix(in srgb, var(--color-bg) 60%, transparent);
		}

		@include mixins.mq-motion-allow {
			&,
			&::backdrop {
				transition:
					opacity 0.3s ease,
					display 0.3s allow-discrete,
					overlay 0.3s allow-discrete;
			}
		}
	}

	.inline {
		position: relative;
		inset: auto;
		width: 100%;
		max-width: 100%;
		height: auto;
		max-height: none;
		margin: 0;
		overflow: visible;
	}

	.panel {
		@include mixins.glass-card(24px, 16px);
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 32px;
		width: min(100%, 1040px);
		padding: 72px 40px 40px;

		@include mixins.max-md {
			padding: 72px 24px 24px;
		}
	}

	h2 {
		margin: 0;
		text-align: center;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;

		@include mixins.max-md {
			grid-template-columns: 1fr;
		}
	}

	.option {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		padding: 0;
		overflow: hidden;
		border: 1px solid var(--color-border);
		border-radius: 16px;
		background: var(--color-glass);
		color: inherit;
		font: inherit;
		text-align: left;
		text-decoration: none;
		cursor: pointer;

		@include mixins.desktop-hover {
			background: var(--color-glass-hover);
		}

		&:focus-visible {
			outline: 2px solid currentColor;
			outline-offset: 2px;
		}
	}

	img {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;

		@include mixins.max-md {
			aspect-ratio: 16 / 9;
		}
	}

	.label {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 20px;
	}

	.panel > :global(.close) {
		position: absolute;
		top: 24px;
		right: 24px;
	}
</style>
