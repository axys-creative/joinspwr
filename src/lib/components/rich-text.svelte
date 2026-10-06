<script lang="ts">
	import { richTextBehaviors } from '$lib/attachments/rich-text';
	import { richText } from '$lib/utils/rich-text';

	let { text }: { text?: string } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<span class="rich-text" {@attach richTextBehaviors(text)}>{@html richText(text)}</span>
