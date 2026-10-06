export type ThemePreference = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

export const theme = $state<{ preference: ThemePreference }>({ preference: 'dark' });

function apply(preference: ThemePreference) {
	const resolved = preference === 'light' ? 'light' : 'dark';
	document.documentElement.dataset.theme = resolved;
}

export function setTheme(preference: ThemePreference) {
	theme.preference = preference;
	try {
		localStorage.setItem(STORAGE_KEY, preference);
	} catch {
		// Storage can be blocked; the choice still applies for this visit.
	}
	apply(preference);
}

// Call once from onMount; returns a cleanup function.
export function initTheme() {
	try {
		theme.preference = (localStorage.getItem(STORAGE_KEY) as ThemePreference) || 'dark';
	} catch {
		theme.preference = 'dark';
	}

	apply(theme.preference);
	return () => {};
}
