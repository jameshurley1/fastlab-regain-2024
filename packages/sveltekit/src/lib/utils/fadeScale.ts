export const fadeScale = (
	node: HTMLElement,
	{ delay = 0, duration = 200, easing = (x: number) => x, baseScale = 0 }
) => {
	const o: number = +getComputedStyle(node).opacity;
	const m: RegExpMatchArray | null = getComputedStyle(node).transform.match(/scale\(([0-9.]+)\)/);
	const s: number = m ? parseFloat(m[1]) : 1;
	const is: number = 1 - baseScale;

	return {
		delay,
		duration,
		css: (t: number) => {
			const eased: number = easing(t);
			return `opacity: ${eased * o}; transform: scale(${eased * s * is + baseScale})`;
		}
	};
};
