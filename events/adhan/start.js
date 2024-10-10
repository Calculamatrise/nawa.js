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
		if (!guildData.reminders || !guildData.reminders.adhan || (guildData.timezone && guildData.timezone !== prayerInfo.timezone)) continue;
		let config = guildData.reminders.adhan;
		this.channels.fetch(config.channelId).then(channel => {
			let suffix = '\n-# ' + prayerInfo.timezone; // '';
			config.mentions && (suffix += ' • *', // suffix += '\n-# *',
			Array.isArray(config.mentions) && (suffix += config.mentions.map(id => '<@&' + id + '>').join('')),
			config.mentions.roles && (suffix += config.mentions.roles.map(id => '<@&' + id + '>').join('')),
			config.mentions.users && (suffix += config.mentions.users.map(id => '<@!' + id + '>').join('')),
			suffix += '*');
			return channel.send({
				content: "It's time to pray **[" + prayerInfo.prayer + "](<https://en.wikipedia.org/wiki/" + prayerInfo.prayer.replace(/^dh?uhr$/i, 'Zuhr') + "_prayer>)**!" + suffix
			})
		}).catch(err => {
			console.warn('[AdhanStart]', err.message || 'Channel not found!');
			return this.database.guilds.delete(guildId, { reminders: ['adhan'] })
		});
	}

	for (let [userId, userData] of this.database.users.cache.entries()) {
		if (!userData || !userData.reminders || !userData.reminders.includes('adhan') || (userData.timezone && userData.timezone !== prayerInfo.timezone)) continue;
		this.users.fetch(userId).then(async user => {
			let channel = user.dmChannel || await user.createDM();
			if (!channel) {
				throw new Error("Channel does not exist");
			}

			return channel.send({ content: "It's time to pray **" + prayerInfo.prayer + "**!" })
		}).catch(err => {
			console.warn('[AdhanStart]', err.message || 'User not found!');
			return this.database.users.delete(userId, { reminders: ['adhan'] })
		});
	}

	let nextPrayer = await Adhan.next(prayerInfo.address);
	nextPrayer || console.warn('[AdhanStart] Next prayer not found!', nextPrayer);
	nextPrayer && this.adhanTimers.set(prayerInfo.timezone, {
		value: setTimeout(this.emit.bind(this), nextPrayer.minutesRemaining * 6e4, 'adhanStart', nextPrayer),
		writable: true
	})
}