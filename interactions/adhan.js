import Adhan from "../utils/adhan.js";

export default {
	description: "Check the time for the adhan.",
	async execute(interaction, options) {
		// add args.shift() if args[0] is in DAILY_PRAYERS
		let location = options.getString('location') || 'Vancouver, BC, Canada';
		let requestedPrayer = options.getString('prayer');
		let date = new Date();
		return Adhan.timings({ address: location, prayer: requestedPrayer }).then(timings => {
			let prayers = Object.keys(timings);
			let prayer = timings[Adhan.toPrayer(requestedPrayer || Object.values(timings).find(prayer => prayer.timeRemaining > 0).prayer)];
			return prayer.prayer + (prayer.timeRemaining < 0 && !prayer.passed ? ' is now!' : ' is at ' + prayer.time + (prayer.offset > 0 ? ' **tomorrow**.' : ''))
		}).catch(err => {
			return {
				content: err.message || "Something went wrong! Failed to find your timezone.",
				ephemeral: true
			}
		})
	},
	options: [{
		name: "prayer",
		description: "The prayer you wish to know the time of.",
		type: 3,
		choices: Adhan.prayers.map(prayer => ({
			name: prayer.toLowerCase().replace(/^\w/, c => c.toUpperCase()),
			value: prayer
		}))
	}, {
		name: "location",
		description: "Enter your city, province, and country for location-sepecific timings.",
		type: 3
	}]
}