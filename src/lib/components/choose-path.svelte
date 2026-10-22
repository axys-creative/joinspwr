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
	import { loading } from '$lib/utils/loading.svelte';
	import { visitorPath, type VisitorPath } from '$lib/utils/visitor-path.svelte';
	import Button from './button.svelte';
	import Icon from './icon.svelte';

	let { static: inline = false, title, options }: ChoosePathProps = $props();

	const tiltOptions = { max: 8, scale: 1.02, glare: true, maxGlare: 0.25 };

	let dialog = $state<HTMLDialogElement>();
	let panel = $state<HTMLElement>();
	let landing = $state(false);
	let veiled = $state(false);
	let arrive = $state(false);
	let opened = false;

	// The loader shrinks to this box when it leaves, so it is measured before the dialog is shown.
	const measure = () => {
		if (!dialog || !panel || dialog.open) return;
		const hide = { visibility: 'hidden', position: 'fixed', inset: '0' };
		Object.assign(dialog.style, hide);
		dialog.show();
		const box = panel.getBoundingClientRect();
		dialog.close();
		Object.keys(hide).forEach((name) => dialog!.style.removeProperty(name));
		const root = document.documentElement.style;
		root.setProperty('--cp-top', `${box.top}px`);
		root.setProperty('--cp-left', `${box.left}px`);
		root.setProperty('--cp-right', `${innerWidth - box.right}px`);
		root.setProperty('--cp-bottom', `${innerHeight - box.bottom}px`);
	};

	const clearBox = () => {
		const root = document.documentElement.style;
		['top', 'left', 'right', 'bottom'].forEach((side) => root.removeProperty(`--cp-${side}`));
	};

	// Only a hard load of the home page asks; the layout persists, so moving around the site never does.
	onMount(() => {
		if (!dialog) return;
		if (inline) return dialog.show();
		if (location.pathname !== '/') return;
		arrive = !loading.done;
		landing = true;
		veiled = true;
		if (!arrive) return;
		measure();
		document.fonts.ready.then(measure);
		return clearBox;
	});

	$effect(() => {
		if (!landing || !loading.done || opened || !dialog) return;
		opened = true;
		dialog.showModal();
		document.dispatchEvent(new CustomEvent('top-layer-open'));
		setTimeout(clearBox, 2000);
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

{#if landing}
	<div class="veil" class:on={veiled} aria-hidden="true"></div>
{/if}

<dialog
	bind:this={dialog}
	class="choose-path"
	class:inline
	aria-labelledby="choose-path-title"
	data-lenis-prevent
	style:--arrive-delay={arrive ? '0.3s' : undefined}
	{onclick}
	onclose={() => opened && (veiled = false)}
>
	<div class="panel" bind:this={panel}>
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

<style lang="scss">
	@use 'base/mixins';

	.choose-path {
		align-items: flex-start;
		justify-content: center;
		overflow-y: auto;
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
			transition-delay: var(--arrive-delay, 0s);

			@starting-style {
				opacity: 0;
			}
		}

		&::backdrop {
			background: transparent;
		}

		@include mixins.mq-motion-allow {
			& {
				transition:
					opacity 0.3s ease,
					display 0.3s allow-discrete,
					overlay 0.3s allow-discrete;
			}
		}
	}

	// Sits behind the loader and the modal for the whole landing, so neither brings its own blur with it.
	.veil {
		@include mixins.glass;
		position: fixed;
		inset: 0;
		z-index: calc(var(--z-loading) - 1);
		background: color-mix(in srgb, var(--color-bg) 60%, transparent);
		opacity: 0;
		pointer-events: none;

		&.on {
			opacity: 1;
		}

		@include mixins.mq-motion-allow {
			transition: opacity 0.4s ease;
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

	// Auto margins center the panel when it fits and let it start at the top, scrollable, when it does not.
	.panel {
		@include mixins.glass-card(24px, 16px);
		position: relative;
		margin: auto;
		display: flex;
		flex-direction: column;
		gap: 32px;
		width: min(100%, 1040px);
		padding: 72px 40px 40px;

		@include mixins.max-md {
			gap: 20px;
			padding: 64px 20px 20px;
		}
	}

	h2 {
		margin: 0;
		text-align: center;

		@include mixins.max-md {
			@include mixins.h3;
		}
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
			aspect-ratio: 5 / 2;
		}
	}

	.label {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 16px 20px;

		@include mixins.max-md {
			@include mixins.h5;
			padding: 12px 16px;
		}
	}

	.panel > :global(.close) {
		position: absolute;
		top: 24px;
		right: 24px;
	}
</style>
