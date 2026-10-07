export const richTextClasses = [
	'italic',
	'primary',
	'scribble',
	'scribble-circle',
	'secondary',
	'secondary-alt',
	'stroke',
	'strong'
] as const;

export type RichTextClass = (typeof richTextClasses)[number];

const TOKEN = /\[([^\]]*)\]\{((?:\.[a-z-]+)+)\}|\{\.br\}/g;

export const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const isRichTextClass = (name: string): name is RichTextClass =>
	(richTextClasses as readonly string[]).includes(name);

/** Wraps `words` in a span for each known class in `.a.b.c`. Unknown classes are dropped and the text stays. */
export function richTextToken(words: string, classes: string) {
	const known = classes.split('.').filter(isRichTextClass);
	const text = escapeHtml(words);
	if (!known.length) return text;

	const drawn = known.find((name) => name.startsWith('scribble'));
	const behavior = drawn ? ` data-rich-text="${drawn}"` : '';
	return `<span class="${known.map((name) => `rich-text--${name}`).join(' ')}"${behavior}>${text}</span>`;
}

/** Turns `[words]{.class}` tokens and `{.br}` into HTML. Everything else is escaped. */
export function richText(text = '') {
	let html = '';
	let last = 0;

	for (const match of text.matchAll(TOKEN)) {
		html += escapeHtml(text.slice(last, match.index));
		html += match[2] === undefined ? '<br />' : richTextToken(match[1], match[2]);
		last = match.index + match[0].length;
	}

	return html + escapeHtml(text.slice(last));
}
