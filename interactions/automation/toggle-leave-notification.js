export default {
	async execute(interaction) {
		const entry = await interaction.client.database.guilds.fetch(interaction.guild.id);
		if (entry && entry.alerts.memberPart) {
			await interaction.client.database.guilds.update(interaction.guildId, {
				alerts: {
					memberPart: null
				}
			});
			return {
				content: "Successfully disabled member leave notifications for this server.",
				ephemeral: true
			}
		}

		await interaction.client.database.guilds.update(interaction.guildId, {
			alerts: {
				memberPart: interaction.channel.id
			}
		});
		return {
			content: `Successfully enabled member leave notifications for this server in ${interaction.channel.name}.`,
			ephemeral: true
		}
	}
}