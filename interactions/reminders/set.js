export default {
	async execute(interaction, options) {
		const event = options.getString('event');
		const mentionable = options.get('mentions');
		const timezone = options.getString('timezone');
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

		let mentions = null;
		if (null !== mentionable) {
			mentions = {},
			mentionable.role && (mentions.roles = [mentionable.role.id]),
			mentionable.user && (mentions.users = [mentionable.user.id]);
		}

		return interaction.client.database[context + 's'].update(interaction[context].id, {
			reminders: 'user' === context ? [event] : {
				[event]: {
					channelId: interaction.channel.id,
					mentions,
					timezone
				}
			}
		}).then(() => {
			return {
				content: `Successfully enabled ${event.replace(/(?=[A-Z])/g, ' ').toLowerCase()} reminders for ${interaction.context === 0 ? 'this server in ' + interaction.channel.name : 'you in your DMs'}.`,
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