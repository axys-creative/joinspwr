<script module lang="ts">
	import type { AlertType } from '$lib/utils/alerts.svelte';

	export type AnnouncementProps = {
		/** Turns the announcement on or off. */
		enabled?: boolean;
		/** `banner` is a scrolling bar across the top of the screen; `alert` is an Alert in the bottom right. */
		type?: 'banner' | 'alert';
		/** Seconds to wait before it shows, counted from when the visitor has chosen a path on the home page (or from the page loading anywhere else). */
		delay?: number;
		/** The alert's title. A banner has none. */
		title?: string;
		/** The banner's scrolling text, or the alert's message. */
		text?: string;
		/** The alert's look. */
		alertType?: AlertType;
		/** An optional link after the banner's text, or under the alert's message. */
		link?: { text?: string; url?: string; newTab?: boolean };
		/** Pixels per second the banner moves. */
		speed?: number;
		/** Shows it at once and in place, and never remembers a close. For the CMS preview. */
		preview?: boolean;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { alerts } from '$lib/utils/alerts.svelte';
	import { loading } from '$lib/utils/loading.svelte';
	import { pathGate } from '$lib/utils/visitor-path.svelte';
	import Alert from './alert.svelte';
	import Button from './button.svelte';
	import Marquee from './marquee.svelte';

	const KEY = 'announcement-closed';

	let {
		enabled = false,
		type = 'banner',
		delay = 5,
		title = '',
		text = '',
		alertType = 'info',
		link,
		speed = 40,
		preview = false
	}: AnnouncementProps = $props();

	let shown = $state(false);
	let height = $state(0);

	const links = $derived(link?.text && link.url ? [{ ...link, type: 'underline' as const }] : []);
	// A changed announcement is a new one, so an earlier close does not hide it.
	const signature = $derived([type, title, text, link?.url].join('|'));
	const live = $derived(shown && enabled && !!text);

	const closed = () => {
		try {
			return sessionStorage.getItem(KEY) === signature;
		} catch {
			return false;
		}
	};

	const close = () => {
		shown = false;
		try {
			sessionStorage.setItem(KEY, signature);
		} catch {
			// Storage can be blocked.
		}
	};

	// Waits for the loader and for the landing modal, then for its own delay. Any change to those starts the wait over.
	$effect(() => {
		if (preview) return;
		shown = false;
		if (!enabled || !text || !loading.done || pathGate.waiting || closed()) return;
		const timer = setTimeout(() => (shown = true), delay * 1000);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (preview || !live || type !== 'alert') return;
		const id = untrack(() =>
			alerts.show({ type: alertType, title, message: text, links, onclose: close })
		);
		return () => alerts.dismiss(id);
	});

	// The header sits below the banner, and anything fixed can use the same variable.
	$effect(() => {
		if (preview || !live || type !== 'banner') return;
		document.documentElement.style.setProperty('--announcement-height', `${height}px`);
		return () => document.documentElement.style.removeProperty('--announcement-height');
	});

	// Only called while the banner exists, so it never runs during server rendering.
	const duration = (ms: number) =>
		matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
</script>

{#snippet banner()}
	<Marquee label={text} {speed} pauseOnHover class="announcement-marquee">
		<span>{text}</span>
		{#if links.length}<a
				href={link?.url}
				target={link?.newTab ? '_blank' : undefined}
				rel={link?.newTab ? 'noopener noreferrer' : undefined}>{link?.text}</a
			>{/if}
	</Marquee>
{/snippet}

{#if preview}
	{#if type === 'alert'}
		<div class="preview-alert">
			<Alert type={alertType} {title} message={text} {links} />
		</div>
	{:else}
		<div class="announcement static" role="region" aria-label="Announcement">
			{@render banner()}
		</div>
	{/if}
{:else if live && type === 'banner'}
	<div
		class="announcement"
		role="region"
		aria-label="Announcement"
		bind:clientHeight={height}
		transition:fly={{ y: -48, duration: duration(500) }}
	>
		{@render banner()}
		<Button
			class="close"
			type="text"
			iconStart="x-lg"
			textDescription="Close announcement"
			onclick={close}
		/>
	</div>
{/if}

<style lang="scss">
	@use 'base/mixins';

	.announcement {
		position: fixed;
		inset: 0 0 auto;
		z-index: var(--z-announcement);
		display: flex;
		align-items: center;
		background: var(--color-accent);
		color: var(--color-on-accent);

		&.static {
			position: relative;
		}
	}

	// The marquee brings its own heading type, so the bar sets it back to body text.
	.announcement :global(.marquee) {
		--gap: 4ch;

		flex: 1;
		min-width: 0;

		padding-block: 10px;
		padding-inline-end: 48px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.02em;
		line-height: 1.4;
		text-transform: uppercase;
	}

	.announcement :global(.marquee .item) {
		display: flex;
		gap: 2ch;
		white-space: nowrap;
	}

	.announcement :global(.marquee a) {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.announcement :global(.close) {
		--btn-padding-icon: 4px;

		position: absolute;
		top: 50%;
		right: 8px;
		translate: 0 -50%;
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.preview-alert {
		display: grid;
		max-width: 420px;
		margin: 24px;
	}
</style>
