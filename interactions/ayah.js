export default {
	description: "Get an ayah from the Quran.",
	async execute(interaction, options) {
		const verse = options.getString('verse');
		const locale = options.getString('locale');
		return fetch("https://api.alquran.cloud/v1/ayah/" + verse + "/" + (locale || 'ar') + ".asad").then(r => r.json()).then(({ code, data }) => {
			if (code !== 200) {
				throw new Error(data)
			}
			return {
				content: data.text + '\n' + data.surah[(locale != 'en' ? 'n' : 'englishN') + 'ame'] + ' — ' + data.surah['englishName' + (locale != 'en' ? '' : 'Translation')]
			}
		}).catch(err => {
			return {
				content: err.message || "Something went wrong! Failed to find a ayah.",
				ephemeral: true
			}
		})
	},
	options: [{
		name: "verse",
		description: "Choose a verse from the Quran.",
		required: true,
		type: 3
		// choices: [{
		// 	name: 'Al-Fatiha',
		// 	value: 1
		// }]
	}, {
		name: "locale",
		description: "Choose which language to output.",
		type: 3,
		choices: [{
			name: 'Arabic',
			value: 'ar'
		}, {
			name: 'English',
			value: 'en'
		}]
	}]
}