import Adhan from "../../utils/adhan.js";

export default {
	async execute(interaction, options) {
		let inheritedTimezone = await interaction.client.database.users.fetch(interaction.user.id).then(r => r && r.timezone);
		inheritedTimezone ||= await interaction.client.database.guilds.fetch(interaction.guild.id).then(r => r && r.timezone);
		const timezone = await Adhan.parseTimezone(options.getString('timezone')) || inheritedTimezone || 'America/Vancouver';
		const context = interaction.context === 0 ? 'guild' : 'user';
		if (interaction.context === 2) {
			let channel = interaction.user.dmChannel || await interaction.user.createDM(true).catch(err => null);
			if (channel === null) {
				return {
					content: "Something went wrong! Failed to create a DM with the target user.",
					ephemeral: true
				}
			}
		}

		return interaction.client.database[context + 's'].update(interaction[context].id, {
			timezone
		}).then(({ timezone }) => {
			return {
				content: `Successfully set the timezone for ${interaction.context === 0 ? 'this server in ' + interaction.channel.name : 'you in your DMs'}.${timezone ? `\n-# ${timezone}` : ''}`,
				ephemeral: true
			}
		}).catch(err => {
			return {
				content: err.message || "Something went wrong! Failed to unset reminder.",
				ephemeral: true
			}
		})
	},
	focus(interaction, option) {
		// console.log(interaction, option.value)
		return [{
			name: 'America/Vancouver',
			value: 'America/Vancouver'
		}]
	}
}