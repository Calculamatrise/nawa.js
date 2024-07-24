export default {
	async execute(interaction, options) {
		console.log(interaction, await interaction.client.database.getStore('reminders'), await interaction.client.database.getStore('users'))
		console.log('reminderset', options.getString('event'), options.getString('location'))
	}
}