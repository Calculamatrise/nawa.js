export default {
	async execute(interaction, options) {
		const event = options.getString('event');
		const mentionable = options.get('mentions');
		const context = interaction.context === 0 ? 'guild' : 'user';
		if (null !== mentionable) {
			const mentions = {};
			mentionable.role && (mentions.roles = [mentionable.role.id]),
			mentionable.user && (mentions.users = [mentionable.user.id]);
			return interaction.client.database[context + 's'].delete(interaction[context].id, {
				reminders: {
					[event]: { mentions }
				}
			}).then(() => {
				return {
					content: `Successfully removed a mention from ${event.replace(/(?=[A-Z])/g, ' ').toLowerCase()} reminders for ${interaction.context === 0 ? 'this server' : 'you'}.`,
					ephemeral: true
				}
			}).catch(err => {
				return {
					content: err.message || "Something went wrong! Failed to unset reminder.",
					ephemeral: true
				}
			});
		}

		return interaction.client.database[context + 's'].delete(interaction[context].id, { reminders: [event] }).then(() => {
			return {
				content: `Successfully disabled ${event.replace(/(?=[A-Z])/g, ' ').toLowerCase()} reminders for ${interaction.context === 0 ? 'this server' : 'you'}.`,
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