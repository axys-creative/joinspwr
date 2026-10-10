<script lang="ts">
	import faq from '$lib/content/page_join/accordion-section.json';
	import contactForm from '$lib/content/page_join/contact-form.json';
	import AccordionSection from '$lib/sections/accordion-section.svelte';
	import ContactForm from '$lib/sections/contact-form.svelte';
</script>

<ContactForm id="contact" hero {...contactForm} />
<AccordionSection id="faq" {...faq} />
