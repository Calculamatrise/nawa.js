import Adhan from "../../utils/adhan.js";

export default async function (prayerInfo) {
	this.setPresence({
		status: 'online',
		activities: [{
			name: prayerInfo.prayer + ' Adhan in ' + prayerInfo.timezone,
			type: 1,
			url: 'https://twitch.tv/calculamatrise'
		}]
	}, 3e5);
	let guilds = Array.from(this.database.guilds.cache.entries()).filter(([guildId, guildData]) => (!guildData.timezone || guildData.timezone === prayerInfo.timezone) && guildData.reminders && 'adhan' in guildData.reminders)
	for (let [guildId, guildData] of guilds) {
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
		this.adhanManager.addSubscriber(guildId, prayerInfo.timezone, { expected: guilds.length })
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

	if (this.adhanTimers.has(prayerInfo.timezone)) {
		clearTimeout(this.adhanTimers.get(prayerInfo.timezone));
	}

	let nextPrayer = await Adhan.next(prayerInfo.address);
	nextPrayer || console.warn('[AdhanStart] Next prayer not found!', nextPrayer);
	nextPrayer && this.adhanTimers.set(prayerInfo.timezone, setTimeout(this.emit.bind(this), nextPrayer.minutesRemaining * 6e4, 'adhanStart', nextPrayer))
}