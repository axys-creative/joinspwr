<script module lang="ts">
	import type { AccordionItem, AccordionProps } from '$lib/components/accordion.svelte';
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type FaqGroup = {
		/** The toggle's button text, such as `New to sales`. */
		label: string;
		/** Selects this group when the visitor's path matches. A group with no path is the general one. */
		path?: 'new' | 'experienced';
		items: AccordionItem[];
	};

	export type FaqTabsProps = Pick<
		SectionCopyProps,
		'eyebrowText' | 'eyebrowIcon' | 'title' | 'description'
	> & {
		groups: FaqGroup[];
		/** The visitor's path. The group with the same `path` is selected, and follows it when it changes. */
		path?: 'new' | 'experienced';
		/** Props of the Accordion: `icon`, `plus`, `singleOpen` and `striped`. */
		accordion?: Omit<AccordionProps, 'items'>;
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Accordion from '$lib/components/accordion.svelte';
	import SectionCopy from '$lib/components/section-copy.svelte';
	import { toggleSlider } from '$lib/attachments/toggle-slider';

	let {
		groups,
		path,
		accordion,
		fullScreen = false,
		id,
		class: className,
		...copy
	}: FaqTabsProps = $props();

	const uid = $props.id();
	const tabbed = $derived(groups.length > 1);
	const pathIndex = (value: typeof path) =>
		Math.max(
			0,
			groups.findIndex((group) => group.path === value && value)
		);

	// svelte-ignore state_referenced_locally
	let selected = $state(pathIndex(path));
	// svelte-ignore state_referenced_locally
	let shown = $state(pathIndex(path));
	let panel: HTMLElement;
	let revealed = false;
	let animated = false;
	let busy = false;

	const LEAVE = { duration: 260, stagger: 30 };
	const ENTER = { duration: 320, stagger: 40 };
	const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

	const rows = () => Array.from(panel.querySelectorAll<HTMLElement>('.accordion > .item'));

	const play = (from: Keyframe, to: Keyframe, { duration, stagger }: typeof LEAVE) => {
		const items = rows();
		const runs = items.map((item, index) =>
			item.animate([from, to], {
				duration,
				delay: index * stagger,
				easing: EASING,
				fill: 'both'
			})
		);
		return Promise.all(runs.map((run) => run.finished.catch(() => {}))).then(() => ({
			items,
			runs
		}));
	};

	const hide = () => rows().forEach((item) => (item.style.opacity = '0'));

	// `direction` is 1 when the toggle moves right (rows leave left, arrive from the right) and -1 when it moves left.
	const leave = (direction: number) =>
		play(
			{ opacity: 1, translate: '0 0' },
			{ opacity: 0, translate: `${-48 * direction}px 0` },
			LEAVE
		);

	const enter = async (direction = 1) => {
		const { items, runs } = await play(
			{ opacity: 0, translate: `${48 * direction}px 0` },
			{ opacity: 1, translate: '0 0' },
			ENTER
		);
		items.forEach((item) => item.style.removeProperty('opacity'));
		runs.forEach((run) => run.cancel());
	};

	// A change that arrives mid-swap is picked up by the loop, so quick clicks never stack animations.
	async function sync() {
		if (busy) return;
		busy = true;
		while (shown !== selected) {
			const next = selected;
			const direction = next > shown ? 1 : -1;
			if (animated && revealed) await leave(direction);
			shown = next;
			await tick();
			if (!animated) continue;
			if (revealed) await enter(direction);
			else hide();
		}
		busy = false;
	}

	function select(index: number, focus = false) {
		selected = index;
		if (focus) document.getElementById(`${uid}-tab-${index}`)?.focus();
		sync();
	}

	function onKeydown(event: KeyboardEvent) {
		const last = groups.length - 1;
		const key = event.key;
		const target =
			key === 'ArrowRight'
				? selected === last
					? 0
					: selected + 1
				: key === 'ArrowLeft'
					? selected === 0
						? last
						: selected - 1
					: key === 'Home'
						? 0
						: key === 'End'
							? last
							: -1;
		if (target < 0) return;
		event.preventDefault();
		select(target, true);
	}

	// The visitor's path can change after mount (it is restored from the session), and the footer can change it.
	// svelte-ignore state_referenced_locally
	let lastPath = path;
	$effect(() => {
		if (path === lastPath) return;
		lastPath = path;
		select(pathIndex(path));
	});

	onMount(() => {
		animated = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!animated) return;

		hide();
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();
				revealed = true;
				enter();
			},
			{ rootMargin: '0px 0px -15% 0px' }
		);
		observer.observe(panel);
		return () => observer.disconnect();
	});
</script>

<section {id} class="faq-tabs {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy level={2} align="center" {...copy} showCta={false} />

		{#if tabbed}
			<div
				class="list"
				role="tablist"
				aria-label={copy.title ?? 'Question groups'}
				tabindex="-1"
				onkeydown={onKeydown}
				{@attach toggleSlider({ variant: 'solid' })}
			>
				{#each groups as group, index (index)}
					<button
						type="button"
						class="tab"
						role="tab"
						id="{uid}-tab-{index}"
						aria-selected={index === selected}
						aria-controls="{uid}-panel"
						tabindex={index === selected ? 0 : -1}
						onclick={() => select(index)}>{group.label}</button
					>
				{/each}
			</div>
		{/if}

		<div
			class="panel"
			role={tabbed ? 'tabpanel' : undefined}
			id="{uid}-panel"
			aria-labelledby={tabbed ? `${uid}-tab-${selected}` : undefined}
			bind:this={panel}
		>
			{#key shown}
				<Accordion
					items={(groups[shown] ?? groups[0])?.items ?? []}
					icon="chevron-down"
					singleOpen
					striped
					{...accordion}
				/>
			{/key}
		</div>
	</div>
</section>

<style lang="scss">
	@use 'base/mixins';

	// Swapping groups resizes the content, and scroll anchoring would answer by scrolling the page.
	// The rows slide sideways, so the section clips at the screen edge rather than at the list.
	.faq-tabs {
		overflow-anchor: none;
		overflow-x: clip;
	}

	// Top-aligned, not centered, so a taller or shorter group grows and shrinks below the title.
	.full-screen {
		display: grid;
		align-items: start;
		min-height: 100lvh;
	}

	.inner {
		display: flex;
		flex-direction: column;
		gap: 48px;
		width: min(800px, 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);
	}

	.list {
		--slider-color: var(--color-accent);

		max-width: 100%;
		align-self: center;
		scrollbar-width: none;

		// Scrolling clips a ring on the border, so the narrow layout draws its border inside the padding edge, where the ring sits, instead of stacking a second line.
		@include mixins.max-md {
			overflow-x: auto;
			padding: 5px;
			border: 0;
			box-shadow: inset 0 0 0 1px var(--color-border);

			&:global(.gradient-border)::before {
				inset: 0;
			}
		}
	}

	.tab {
		flex-shrink: 0;
		padding: var(--btn-padding-sm);
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-size: 13px;
		font-weight: var(--btn-font-weight);
		white-space: nowrap;

		@include mixins.mq-motion-allow {
			transition:
				opacity var(--duration) var(--ease),
				color var(--duration) var(--ease),
				scale 0.24s ease;
		}

		@include mixins.desktop-hover {
			opacity: 0.8;
		}

		&:global([data-active]) {
			color: var(--color-on-accent);
		}

		&:focus-visible {
			outline: 2px solid var(--color-accent-text);
			outline-offset: 2px;
		}
	}
</style>
