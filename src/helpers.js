export function randomColorPickHex() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

export function colorCount() {
	let count = 0;
	if (count < 360) {
		setTimeout(() => {
			count++;
		}, 200);
	} else if (count === 360) {
		count = 0;
	}

	return count;
}
