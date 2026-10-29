const normalize = (text: string) =>
	text
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '');

/** Every word of the query is found in the name, or the query's letters appear in the name in order ("gdlp" finds GoodLeap). */
export function matchesName(name: string, query: string) {
	const target = normalize(name);
	const words = query.split(/\s+/).map(normalize).filter(Boolean);
	if (!words.length) return true;
	if (words.every((word) => target.includes(word))) return true;

	const letters = normalize(query);
	if (letters.length < 2) return false;
	let at = 0;
	for (const char of target) if (char === letters[at]) at++;
	return at === letters.length;
}

/** The indexes of the names that match, or `null` when the query is empty. */
export function searchNames(names: string[], query: string) {
	if (!query.trim()) return null;
	return new Set(names.flatMap((name, index) => (matchesName(name, query) ? [index] : [])));
}
