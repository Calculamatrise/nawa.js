import Adhan from "../../utils/adhan.js";

export default {
	async execute(interaction, options) {
		const entry = await interaction.client.database.guilds.fetch(interaction.guild.id);
		if (entry && entry.alerts.adhan) {
			await interaction.client.database.guilds.update(interaction.guildId, {
				adhan: {
					channelId: null,
					dailyPrayers: [],
					mentions: [],
					timezone: null
				},
				alerts: {
					adhan: null
				}
			});
			return {
				content: "Successfully disabled adhan notifications for this server.",
				ephemeral: true
			}
		}

		let mentions = [];
		let role = options.getRole('role');
		role && mentions.push(role.id);
		await interaction.client.database.guilds.update(interaction.guildId, {
			adhan: {
				channelId: interaction.channelId,
				dailyPrayers: Adhan.prayers,
				mentions,
				timezone: options.getString('location')
			},
			alerts: {
				adhan: interaction.channelId
			}
		});
		return {
			content: `Successfully enabled adhan notifications for this server in ${interaction.channel.name}.`,
			ephemeral: true
		}
	}
}