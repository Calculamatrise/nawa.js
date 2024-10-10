export default {
	async execute(interaction) {
		const context = interaction.context === 0 ? 'guild' : 'user';
		return interaction.client.database[context + 's'].delete(interaction[context].id, 'timezone').then(() => {
			return {
				content: `Successfully unset the timezone for ${interaction.context === 0 ? 'this server' : 'you'}.`,
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