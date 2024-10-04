export default {
	async execute(interaction, options) {
		const event = options.getString('event');
		const mentions = options.getMentionable('mentions');
		const timezone = options.getString('timezone');
		const context = interaction.context === 0 ? 'guild' : 'user';
		let channel = interaction.channel;
		if (interaction.context === 2) {
			channel = await interaction.user.createDM(true).catch(err => null);
			if (channel === null) {
				return {
					content: "Something went wrong! Failed to create a DM with the target user.",
					ephemeral: true
				}
			}
		}

		return interaction.client.database[context + 's'].update(interaction[context].id, {
			reminders: {
				[event]: {
					channelId: interaction.channel.id,
					mentions: mentions && [mentions.id],
					timezone
				}
			}
		}).then(() => {
			return {
				content: `Successfully enabled ${event.replace(/(?=[A-Z])/g, ' ').toLowerCase()} reminders for this server in ${interaction.channel.name}.`,
				ephemeral: true
			}
		}).catch(err => {
			return {
				content: err.message || "Something went wrong! Failed to unset reminder.",
				ephemeral: true
			}
		})
	}
}