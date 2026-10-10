<script module lang="ts">
	import type { FormProps } from '$lib/components/form.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ContactFormProps = Omit<SectionCopyProps, 'level' | 'layout'> & {
		/** Props of the Form. The section defaults to a glass `outline` form with name, phone, address and discovery fields. */
		form?: FormProps;
		/** The text message consent wording, truncated until the visitor opens it. */
		consent?: string;
		/** Links under the consent wording, such as the privacy policy and terms of use. */
		consentLinks?: FormProps['consentLinks'];
		/** Makes it the page's hero: the title is the level 1 heading, with the hero's description width and top spacing. */
		hero?: boolean;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. Defaults to `true` for a `hero`. */
		fullScreen?: boolean;
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import Form from '$lib/components/form.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		form,
		consent,
		consentLinks,
		hero = false,
		fullScreen = hero,
		id,
		class: className,
		...copy
	}: ContactFormProps = $props();

	const hasCopy = $derived(Object.values(copy).some(Boolean));
</script>

<section {id} class="contact-form {className ?? ''}" class:hero class:full-screen={fullScreen}>
	<div class="inner">
		{#if hasCopy}
			<header class="header">
				<SectionCopy level={hero ? 1 : 2} align="center" {...copy} />
			</header>
		{/if}

		<Form
			name="join"
			variant="outline"
			glass
			splitName
			showPhone
			showAddress
			showDiscovery
			showRecaptcha
			{consent}
			{consentLinks}
			{...form}
		/>
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
		width: min(720px, 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);
	}

	.hero {
		--description-width: var(--max-width-text);

		// Clears the floating header, the same as the Culture hero with a title above its frame.
		.inner {
			padding-block-start: 248px;

			@include mixins.max-md {
				padding-block-start: 168px;
			}
		}
	}

	.header {
		margin-block-end: var(--body-padding);
	}
</style>
