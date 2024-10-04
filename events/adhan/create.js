import Adhan from "../../utils/adhan.js";

export default async function (prayerInfo) {
	this.setPresence({
		status: 'online',
		activities: [{
			name: prayerInfo.prayer + ' Adhan',
			type: 1,
			url: 'https://twitch.tv/calculamatrise'
		}]
	});
	for (let [guildId, guildData] of this.database.guilds.cache.entries()) {
		if (!guildData.reminders || !guildData.reminders.adhan) continue;
		let config = guildData.reminders.adhan;
		this.guilds.fetch(guildId).then(async guild => {
			let channel = await guild.channels.fetch(config.channelId);
			if (!channel) {
				return this.database.guilds.delete(guildId, { reminders: ['adhan'] });
			}

			return channel.send({
				content: config.mentions.map(id => '<@&' + id + '>').join(', ') + " It's time to pray " + prayerInfo.prayer + " !"
			})
			console.log(channel, config)
		}).catch(err => {
			console.warn('[AdhanCreate]', 'Guild not found!')
		});
	}

	// iterate users for private reminders

	let nextPrayer = await Adhan.next('Vancouver, BC, Canada');
	nextPrayer && (this._nextPrayerTimeout = setTimeout(this.emit.bind(this), nextPrayer.timeRemaining * 6e4, 'adhanCreate', nextPrayer))
}