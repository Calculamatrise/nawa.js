export default {
	async execute(interaction, options) {
		const event = options.getString('event');
		const message = options.getString('message');
		const payload = { channelId: interaction.channel.id };
		message !== null && (payload.customMessage = message.replace(/(?<=.{100}).+/, '…'));
		const entry = await interaction.client.database.guilds.fetch(interaction.guild.id);
		if (entry && entry.alerts && JSON.stringify(entry.alerts[event]) === JSON.stringify(payload)) {
			return {
				content: event.replace(/(?=[A-Z])/, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()) + ' notifications are already enabled in this channel.',
				ephemeral: true
			}
		}

		return interaction.client.database.guilds.update(interaction.guildId, {
			alerts: { [event]: payload }
		}).then(() => {
			return {
				content: `Successfully enabled ${event.replace(/(?=[A-Z])/g, ' ').toLowerCase()} notifications for this server in ${interaction.channel.name}.`,
				ephemeral: true
			}
		}).catch(err => {
			return {
				content: err.message || "Something went wrong! Failed to enable automation.",
				ephemeral: true
			}
		})
	}
}