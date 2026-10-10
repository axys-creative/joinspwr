import type { Component } from 'svelte';
import globalCss from '../../styles/styles.scss?inline';
import AccordionSection from '$lib/sections/accordion-section.svelte';
import AccordionTableSection from '$lib/sections/accordion-table-section.svelte';
import ContactForm from '$lib/sections/contact-form.svelte';
import CircleHighlight from '$lib/sections/circle-highlight.svelte';
import CarouselTunnel from '$lib/sections/carousel-tunnel.svelte';
import Headline from '$lib/sections/headline.svelte';
import EarningsPotential from '$lib/sections/earnings-potential.svelte';
import FinanceGrid from '$lib/sections/finance-grid.svelte';
import FinanceMarquee from '$lib/sections/finance-marquee.svelte';
import GalleryHorizontal from '$lib/sections/gallery-horizontal.svelte';
import HeroGnomon from '$lib/sections/hero-gnomon.svelte';
import HeroImageCircle from '$lib/sections/hero-image-circle.svelte';
import HeroImageWave from '$lib/sections/hero-image-wave.svelte';
import Oss from '$lib/sections/oss.svelte';
import PhotoColumns from '$lib/sections/photo-columns.svelte';
import ScrollTimeline from '$lib/sections/scroll-timeline.svelte';
import Tools from '$lib/sections/tools.svelte';
import VideoSection from '$lib/sections/video-section.svelte';
import history from '$lib/content/page_oss/accordion-table.json';
import { mountPreview, type PreviewHost } from './preview-host.svelte';

type Data = Record<string, unknown>;
type Cta = { primary?: unknown; secondary?: { text?: string } };
type Section = Component<Record<string, unknown>>;
type Instance = {
	el: HTMLElement | null;
	host: PreviewHost | null;
	observer: MutationObserver | null;
	props: { entry: Entry };
};
type Preview = { component: Section; props?: (data: Data) => Data };
type Cms = {
	registerPreviewTemplate: (name: string, template: unknown) => void;
};
type Entry = { getIn: (path: string[]) => { toJS: () => Data } | undefined };

// Keyed by the Decap file (or collection) name in config.json.
const previews: Record<string, Preview> = {
	accordion_section: {
		component: AccordionSection as unknown as Section,
		props: (data) => ({ ...data, items: data.items ?? [] })
	},
	accordion_table: {
		component: AccordionTableSection as unknown as Section,
		props: (data) => ({ ...data, columns: data.columns ?? [], items: data.items ?? [] })
	},
	contact_form: {
		component: ContactForm as unknown as Section,
		props: (data) => ({ ...data, form: data.form ?? {}, hero: true })
	},
	carousel_tunnel: {
		component: CarouselTunnel as unknown as Section,
		props: (data) => ({ ...data, slides: data.slides ?? [], static: true })
	},
	circle_highlight: {
		component: CircleHighlight as unknown as Section,
		props: (data) => ({ ...data, slices: data.slices ?? [] })
	},
	earnings_potential: {
		component: EarningsPotential as unknown as Section,
		props: (data) => ({ ...data, tabs: data.tabs ?? [], static: true })
	},
	finance_grid: {
		component: FinanceGrid as unknown as Section,
		props: (data) => ({ ...data, logos: data.logos ?? [] })
	},
	finance_marquee: {
		component: FinanceMarquee as unknown as Section,
		props: (data) => ({ ...data, logos: data.logos ?? [] })
	},
	gallery_horizontal: {
		component: GalleryHorizontal as unknown as Section,
		props: (data) => ({ ...data, groups: data.groups ?? [], static: true })
	},
	headline: {
		component: Headline as unknown as Section,
		props: (data) => ({ ...data, text: data.text ?? '' })
	},
	hero_gnomon: {
		component: HeroGnomon as unknown as Section,
		props: (data) => ({ ...data, slides: data.slides ?? [], autoplay: undefined })
	},
	hero_image_circle: {
		component: HeroImageCircle as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as Cta;
			return {
				...data,
				images: data.images ?? [],
				cta: { primary: cta.primary, secondary: cta.secondary?.text ? cta.secondary : undefined },
				direction: 'center'
			};
		}
	},
	hero_image_circle_left: {
		component: HeroImageCircle as unknown as Section,
		props: (data) => {
			const cta = (data.cta ?? {}) as Cta;
			return {
				...data,
				images: data.images ?? [],
				cta: { primary: cta.primary, secondary: cta.secondary?.text ? cta.secondary : undefined },
				direction: 'left'
			};
		}
	},
	hero_image_wave: {
		component: HeroImageWave as unknown as Section,
		props: (data) => {
			const latest = history.items[0];
			const derived = latest ? `Highlights from{.br}${latest.location} ${latest.year}` : undefined;
			const custom = typeof data.accent === 'string' ? data.accent.trim() : '';
			const { showAccent, ...rest } = data;
			return {
				...rest,
				images: (data.images as unknown[] | undefined)?.length
					? data.images
					: (latest?.images ?? []),
				accent: showAccent === false ? undefined : custom || derived
			};
		}
	},
	oss: {
		component: Oss as unknown as Section,
		props: (data) => ({ ...data, images: data.images ?? [], static: true })
	},
	photo_columns: {
		component: PhotoColumns as unknown as Section,
		props: (data) => ({
			...data,
			images: data.images ?? [],
			columns: (data.columns as number[] | undefined)?.length ? data.columns : undefined
		})
	},
	scroll_timeline: {
		component: ScrollTimeline as unknown as Section,
		props: (data) => ({
			...data,
			events: data.events ?? [],
			variant: 'circle'
		})
	},
	tools: {
		component: Tools as unknown as Section,
		props: (data) => ({ ...data, slides: data.slides ?? [] })
	},
	video_section: {
		component: VideoSection as unknown as Section,
		props: (data) => ({
			...data,
			video: {
				...(data.video as object),
				track: 'ticks',
				playButton: false,
				sideControls: { side: 'left', volume: true, fullscreen: true }
			}
		})
	}
};

// Component styles are injected into the admin's head; the preview iframe has to carry its own copies.
const componentStyles =
	'style[data-vite-dev-id]:not([data-vite-dev-id*="/admin/"]), link[href*="/_app/"][rel="stylesheet"]';

function syncStyles(doc: Document) {
	const own =
		doc.head.querySelector('style[data-preview-global]') ??
		doc.head.appendChild(doc.createElement('style'));
	own.setAttribute('data-preview-global', '');
	own.textContent = globalCss;

	for (const node of document.head.querySelectorAll(componentStyles)) {
		const key = node.getAttribute('data-vite-dev-id') ?? node.getAttribute('href');
		const existing = [...doc.head.children].find(
			(el) => el.getAttribute('data-preview-key') === key
		);
		if (existing) {
			if (node.tagName === 'STYLE') existing.textContent = node.textContent;
			continue;
		}
		const copy = node.cloneNode(true) as Element;
		copy.setAttribute('data-preview-key', key ?? '');
		doc.head.append(copy);
	}
}

function dataOf(entry: Entry, preview: Preview): Data {
	const data = entry.getIn(['data'])?.toJS() ?? {};
	return preview.props ? preview.props(data) : data;
}

function template(preview: Preview) {
	const { createClass, h } = window as unknown as {
		createClass: (spec: object) => unknown;
		h: (tag: string, props: object) => unknown;
	};

	return createClass({
		el: null,
		host: null,
		observer: null,

		componentDidMount(this: Instance) {
			const doc = this.el!.ownerDocument;
			doc.documentElement.dataset.theme = document.documentElement.dataset.theme ?? 'dark';
			syncStyles(doc);
			this.observer = new MutationObserver(() => syncStyles(doc));
			this.observer.observe(document.head, { childList: true, subtree: true, characterData: true });
			this.host = mountPreview(this.el!, preview.component, dataOf(this.props.entry, preview));
		},

		componentDidUpdate(this: Instance) {
			this.host?.update(dataOf(this.props.entry, preview));
		},

		componentWillUnmount(this: Instance) {
			this.observer?.disconnect();
			this.host?.destroy();
		},

		render(this: Instance) {
			return h('div', {
				ref: (el: HTMLElement | null) => (this.el = el),
				style: {
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center'
				}
			});
		}
	});
}

export function registerPreviews(cms: Cms) {
	for (const [name, preview] of Object.entries(previews)) {
		cms.registerPreviewTemplate(name, template(preview));
	}
}
