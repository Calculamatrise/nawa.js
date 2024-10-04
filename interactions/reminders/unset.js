export default {
	async execute(interaction, options) {
		const event = options.getString('event');
		const context = interaction.context === 0 ? 'guild' : 'user';
		let channel = interaction.channel;
		if (interaction.context !== 0) {
			channel = await interaction.user.createDM(true).catch(err => null);
			if (channel === null) {
				return {
					content: "Something went wrong! Failed to create a DM with the target user.",
					ephemeral: true
				}
			}
		}

		return interaction.client.database[context + 's'].delete(interaction[context].id, { reminders: [event] }).then(() => {
			return {
				content: `Successfully disabled ${event.replace(/(?=[A-Z])/g, ' ').toLowerCase()} reminders for this server.`,
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