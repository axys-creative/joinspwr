<script module lang="ts">
	export type FormConsentProps = {
		/** The field's `name`, sent with the form. */
		name?: string;
		/** The full consent wording. It shows in two lines until the visitor opens it. */
		text: string;
		/** Links shown under the text, such as the privacy policy. They are not truncated. */
		links?: { text: string; url: string }[];
		/** Whether the box must be checked to submit. Text message consent should stay optional. */
		required?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	import { underline } from '$lib/attachments/underline';
	import Button from './button.svelte';
	import FormChoice from './form-choice.svelte';

	let {
		name = 'sms-consent',
		text,
		links = [],
		required = false,
		class: className
	}: FormConsentProps = $props();

	let open = $state(false);

	const listFormat = new Intl.ListFormat('en', { type: 'conjunction' });
	const parts = $derived(
		listFormat.formatToParts(links.map((link) => link.text)).map((part) => {
			const link =
				part.type === 'element' ? links.find((item) => item.text === part.value) : undefined;
			return { value: part.value, url: link?.url };
		})
	);
</script>

<div class="consent {className ?? ''}" class:open>
	<FormChoice {name} label={text} {required} class="choice-text" />
	<Button
		type="outline"
		size="sm"
		iconStart="chevron-down"
		textDescription={open ? 'Show less of the consent text' : 'Show all of the consent text'}
		expanded={open}
		onclick={() => (open = !open)}
	/>
	{#if links.length}
		<p class="links" {@attach underline({ selector: 'a' })}>
			View our
			{#each parts as part, index (index)}{#if part.url}<a href={part.url}>{part.value}</a
					>{:else}{part.value}{/if}{/each}.
		</p>
	{/if}
</div>

<style lang="scss">
	@use 'base/mixins';

	.consent {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: start;
		gap: 12px;
		width: 100%;
		font-size: 0.875em;
		color: var(--color-text-muted);
	}

	.consent :global(.choice) {
		align-items: flex-start;
	}

	.consent :global(.choice .box) {
		margin-block-start: 0.15em;
	}

	.consent :global(.choice .text) {
		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}

	.open :global(.choice .text) {
		display: block;
		-webkit-line-clamp: unset;
		line-clamp: unset;
	}

	.links {
		grid-column: 1;
		margin-inline-start: 2em;
	}

	// The same links as the policy pages: the underline attachment draws the line, and the color fades.
	.links a {
		color: var(--color-text);
		font-family: inherit;
		text-decoration: underline;
		text-underline-offset: 0.2em;

		@include mixins.mq-motion-allow {
			transition:
				color 0.5s var(--ease),
				background-size var(--duration) var(--ease);
		}

		&:global(.underline-effect) {
			text-decoration: none;
		}

		&:hover {
			color: var(--color-accent-text);
		}
	}
</style>
