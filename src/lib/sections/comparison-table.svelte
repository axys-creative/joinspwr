<script module lang="ts">
	import type { SectionCopyProps } from '$lib/components/section-copy.svelte';

	export type ComparisonRow = {
		label: string;
		/** The first column's value. Text in parentheses shows smaller and muted. */
		primary: string;
		/** The second column's value. Text in parentheses shows smaller and muted. */
		secondary: string;
	};

	export type ComparisonTableProps = Pick<SectionCopyProps, 'cta'> & {
		/** Rich text: `[words]{.primary}` tokens add color, scribble and more, and `{.br}` breaks the line. */
		title?: string;
		/** The first column's heading, the one drawn with the accent. */
		primaryLabel: string;
		secondaryLabel: string;
		rows: ComparisonRow[];
		/** At least the height of the screen, with the content centered. Taller content still grows past it. */
		fullScreen?: boolean;
		/** The section's anchor, so a link or the CMS preview can point to `#id`. */
		id?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import SectionCopy from '$lib/components/section-copy.svelte';

	let {
		title,
		primaryLabel,
		secondaryLabel,
		rows,
		cta,
		fullScreen = false,
		id,
		class: className
	}: ComparisonTableProps = $props();

	const split = (value: string) => {
		const match = value.match(/^(.*?)\s*\((.*)\)\s*$/);
		return match ? { main: match[1], note: match[2] } : { main: value, note: '' };
	};
</script>

{#snippet cell(value: string)}
	{@const { main, note } = split(value)}
	{main}{#if note}<span class="note">({note})</span>{/if}
{/snippet}

<section {id} class="comparison-table {className ?? ''}" class:full-screen={fullScreen}>
	<div class="inner">
		<SectionCopy
			level={2}
			align="center"
			{title}
			showEyebrow={false}
			showDescription={false}
			showCta={false}
		/>

		<table>
			<thead>
				<tr>
					<td></td>
					<th scope="col" class="primary">{primaryLabel}</th>
					<th scope="col">{secondaryLabel}</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row, index (index)}
					<tr>
						<th scope="row">{row.label}</th>
						<td class="primary" data-label={primaryLabel}>{@render cell(row.primary)}</td>
						<td class="secondary" data-label={secondaryLabel}>{@render cell(row.secondary)}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if cta}
			<SectionCopy
				{cta}
				align="center"
				showEyebrow={false}
				showTitle={false}
				showDescription={false}
			/>
		{/if}
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
		display: flex;
		flex-direction: column;
		gap: 48px;
		width: min(var(--content-width), 100% - var(--body-padding) * 2);
		margin-inline: auto;
		padding-block: var(--body-padding-double);
	}

	table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		text-align: left;
		@include mixins.glass-card($radius: var(--radius-lg));
		overflow: clip;
	}

	th,
	td {
		padding: 24px 32px;
		border-bottom: 1px solid var(--color-border);
		font-weight: inherit;
		vertical-align: top;

		@include mixins.max-md {
			padding: 16px 20px;
		}
	}

	tbody tr:last-child > * {
		border-bottom: 0;
	}

	thead th {
		width: 36%;
		@include mixins.h5;
		color: var(--color-text-muted);

		&.primary {
			color: var(--color-accent-text);
		}
	}

	tbody th {
		@include mixins.h6;
		width: 28%;
		text-align: left;
	}

	td {
		@include mixins.h5;

		&.primary {
			background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		}

		&.secondary {
			color: var(--color-text-muted);
		}
	}

	thead th.primary {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
	}

	.note {
		display: block;
		margin-block-start: 4px;
		color: var(--color-text-muted);
		font-size: 0.7em;
		line-height: 1.4;
	}

	// Below md each row becomes a block: the label, then the two values side by side under their column names.
	@include mixins.max-md {
		thead {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}

		tbody tr {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			border-bottom: 1px solid var(--color-border);

			&:last-child {
				border-bottom: 0;
			}
		}

		tbody tr > * {
			border-bottom: 0;
		}

		tbody th {
			grid-column: 1 / -1;
			width: auto;
			padding-block-end: 0;
		}

		td::before {
			content: attr(data-label);
			display: block;
			margin-block-end: 4px;
			color: var(--color-text-muted);
			font-size: 12px;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}
	}
</style>
