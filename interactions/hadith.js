const NARRATOR_LIMITS = {
	BUKHARI: 7563,
	MUSLIM: 3032,
	ABUDAWUD: 3998,
	IBNMAJAH: 4342,
	TIRMIDHI: 3956
}
const NARRATORS = Object.keys(NARRATOR_LIMITS);
const random = arr => arr[Math.floor(arr.length * Math.random())];
export default {
	description: "Get a random hadith.",
	async execute(interaction, options) {
		let narrator = options.getString('narrator') || NARRATORS[Math.floor(NARRATORS.length * Math.random())];
		return fetch("https://random-hadith-generator.vercel.app/" + narrator.toLowerCase() + "/" + (1 + Math.floor((NARRATOR_LIMITS[narrator] - 1) * Math.random()))).then(r => r.json()).then(({ data }) => {
			return {
				content: data.hadith_english.replace(/\n+/g, '') + '\n' + data.refno
			}
		}).catch(err => {
			return {
				content: err.message || "Something went wrong! Failed to find a hadith.",
				ephemeral: true
			}
		})
		// return fetch("https://www.hadithapi.com/public/api/hadiths?apiKey=" + process.env.HADITH_API_KEY + "&hadithEnglish&paginate=1").then(r => r.json()).then(({ status, hadiths }) => {
		// 	if (status !== 200) {
		// 		throw new Error(message)
		// 	}
		// 	console.log(hadiths)
		// }).catch(err => {
		// 	return message.reply(err.message || "Something went wrong! Failed to find a hadith.")
		// })
	},
	options: [{
		name: "narrator",
		description: "Choose which narrator to pick a hadith from.",
		type: 3,
		choices: Object.keys(NARRATOR_LIMITS).map(narrator => ({
			name: narrator,
			value: narrator
		}))
	}]
}