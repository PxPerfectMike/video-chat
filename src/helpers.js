export function generateLoginHash() {
	const hash = crypto.createHash('sha256');
	hash.update('login');
	return hash.digest('hex');
}

export function generateRandomAnimalName() {
	const animals = [
		'Alligator',
		'Ant',
		'Bear',
		'Bee',
		'Bird',
		'Camel',
		'Cat',
		'Chicken',
		'Chimpanzee',
		'Cow',
		'Crocodile',
		'Dog',
		'Dolphin',
		'Duck',
		'Eagle',
		'Elephant',
		'Fish',
		'Fly',
		'Fox',
		'Frog',
		'Giraffe',
		'Goat',
		'Goldfish',
		'Hamster',
		'Hippo',
		'Horse',
		'Kangaroo',
		'Koala',
		'Lion',
		'Lizard',
		'Monkey',
		'Owl',
		'Panda',
		'Pig',
		'Puppy',
		'Rabbit',
		'Rhino',
		'Sheep',
		'Snake',
		'Sparrow',
		'Squirrel',
		'Tiger',
		'Turtle',
		'Wolf',
		'Zebra',
	];
	const colors = [
		'Black',
		'Blue',
		'Brown',
		'Gray',
		'Green',
		'Orange',
		'Pink',
		'Purple',
		'Red',
		'White',
		'Yellow',
	];
	const animal = animals[Math.floor(Math.random() * animals.length)];
	const color = colors[Math.floor(Math.random() * colors.length)];
	return `${color} ${animal}`;
}
