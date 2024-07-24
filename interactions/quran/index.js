export default {
	description: "Surah player",
	options: [{
		description: "Play a Surah of the Quran.",
		name: 'play',
		type: 1,
		options: [{
			name: "surah",
			description: "Name of the surah you wish to listen to.",
			type: 3
		}, {
			name: "reciter",
			description: "Name of your preferred reciter.",
			type: 3
		}]
	}]
}