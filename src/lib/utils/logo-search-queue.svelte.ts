const inView = $state<string[]>([]);

let lastY = 0;

export const searchQueue = {
	/** The search shown: the one whose section most recently came into view. */
	get active() {
		return inView.at(-1) ?? null;
	},
	/** 1 when the last change came from scrolling down, -1 from scrolling up. */
	direction: 1,
	/** True when a search was on screen as the active one changed hands. */
	handoff: false,
	enter(id: string) {
		this.mark(inView.length > 0);
		inView.push(id);
	},
	leave(id: string) {
		const index = inView.indexOf(id);
		if (index === -1) return;
		this.mark(index === inView.length - 1 && inView.length > 1);
		inView.splice(index, 1);
	},
	mark(handoff: boolean) {
		this.direction = scrollY >= lastY ? 1 : -1;
		this.handoff = handoff;
		lastY = scrollY;
	}
};
