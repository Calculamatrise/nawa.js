import { ChannelType } from "discord.js";

export default async function(channel) {
	if (channel.type === ChannelType.DM) {
		return this.database.users.fetch(channel.recipientId).then(data => {
			if (!data || !data.reminders) return;
			return this.database.users.delete(channel.recipientId, 'reminders')
		}).catch(err => {
			console.warn("Failed to delete channel from reminders:", err)
		});
	}

	this.database.guilds.fetch(channel.guildId).then(data => {
		if (!data || !data.reminders) return;
		let remove = [];
		for (let key in data.reminders) {
			let reminder = data.reminders[key];
			reminder.channelId === channel.id && remove.push(key)
		}
		return remove.length > 0 && this.database.guilds.delete(channel.guildId, { reminders: remove })
	}).catch(err => {
		console.warn("Failed to delete channel from reminders:", err)
	})
}