<script lang="ts">
	import faq from '$lib/content/page_join/faq-tabs.json';
	import contactForm from '$lib/content/page_join/contact-form.json';
	import FaqTabs, { type FaqGroup } from '$lib/sections/faq-tabs.svelte';
	import ContactForm from '$lib/sections/contact-form.svelte';
</script>

<ContactForm id="contact" hero {...contactForm} />
<FaqTabs id="faq" {...faq} groups={faq.groups as FaqGroup[]} />

<style lang="scss">
	:global(#faq) {
		margin-block: 128px;
	}
</style>
