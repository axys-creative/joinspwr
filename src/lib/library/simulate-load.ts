// LIBRARY: DELETE ME. A fake load for the loader demos; a site tracks the real page.
/** A `track` for a loader that reports progress evenly over `ms` milliseconds. */
export const simulateLoad = (ms: number) => (update: (progress: number) => void) => {
	const start = performance.now();
	let frame = 0;

	const tick = () => {
		const progress = Math.min(1, (performance.now() - start) / ms);
		update(progress);
		if (progress < 1) frame = requestAnimationFrame(tick);
	};
	frame = requestAnimationFrame(tick);

	return () => cancelAnimationFrame(frame);
};
