export default {
	async execute(interaction, options) {
		const event = options.getString('event');
		const eventName = event && event.replace(/(?=[A-Z])/, ' ').toLowerCase();
		const entry = await interaction.client.database.guilds.fetch(interaction.guild.id);
		if (event === null) {
			return interaction.client.database.guilds.delete(interaction.guildId, 'alerts').then(res => {
				return {
					content: 'All automated notifications are have been disabled for this server.',
					ephemeral: true
				}
			}).catch(err => {
				return {
					content: err.message || 'Something went wrong! Failed to modify notification configuration for this server.',
					ephemeral: true
				}
			});
		}

		if (!entry || !entry.alerts || !entry.alerts[event]) {
			return {
				content: eventName.replace(/^\w/, c => c.toUpperCase()) + ' notifications are not enabled in this server.',
				ephemeral: true
			}
		}
		return interaction.client.database.guilds.delete(interaction.guildId, { alerts: [event] }).then(() => {
			return {
				content: `Successfully disabled ${eventName} notifications for this server.`,
				ephemeral: true
			}
		}).catch(err => {
			return {
				content: err.message || 'Something went wrong! Failed to modify notification configuration for this server.',
				ephemeral: true
			}
		})
	}
}