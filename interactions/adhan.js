import Adhan from "../utils/adhan.js";

export default {
	contexts: [0, 1, 2],
	description: "Check the time for the adhan.",
	async execute(interaction, options) {
		let timezone = await interaction.client.database.users.fetch(interaction.user.id).then(r => r && r.timezone);
		timezone ||= await interaction.client.database.guilds.fetch(interaction.guild.id).then(r => r && r.timezone),
		timezone && (timezone = timezone.replace(/.+\//, ''));
		let location = options.getString('location') || timezone || 'Vancouver, BC, Canada'; // get user option
		let requestedPrayer = options.getString('prayer');
		return Adhan.timings({ address: location, prayer: requestedPrayer }).then(timings => {
			let prayers = Object.keys(timings);
			let prayer = timings[Adhan.toPrayer(requestedPrayer || Object.values(timings).find(prayer => prayer.minutesRemaining > 0).prayer)];
			return (interaction.context === 0 ? Adhan.wikiPrayer(prayer.prayer) : prayer.prayer) + (prayer.minutesRemaining < 0 && !prayer.passed ? ' is now!' : ' is at ' + prayer.time + (prayer.offset > 0 ? ' **tomorrow**.' : '')) + '\n-# ' + prayer.timezone
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