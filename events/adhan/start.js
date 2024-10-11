import { ChannelType } from "discord.js";
import Adhan from "../../utils/adhan.js";
import { AudioPlayer, AudioPlayerStatus, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnectionStatus } from "@discordjs/voice";

export default async function (prayerInfo) {
	this.setPresence({
		status: 'online',
		activities: [{
			name: prayerInfo.prayer + ' Adhan',
			type: 1,
			url: 'https://twitch.tv/calculamatrise'
		}]
	}, 3e5);
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
		callAdhan.call(this, guildId)
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

async function callAdhan(guildId) {
	let guild = await this.guilds.fetch(guildId);
	let voiceChannels = guild.voiceStates.cache.map(voiceState => voiceState.channel);
	if (voiceChannels.length < 1) {
		voiceChannels = guild.channels.cache.filter(channel => channel.type == ChannelType.GuildVoice || channel.type == ChannelType.GuildStageVoice);
		voiceChannels.sort((a, b) => a.rawPosition - b.rawPosition);
		voiceChannels = Array.from(voiceChannels.values());
		if (voiceChannels.length < 1) {
			return;
		}
	}

	let voiceChannel = voiceChannels[0];
	let audioPlayer = new AudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play }});
	audioPlayer.on('stateChange', (oldState, newState) => {
		switch (newState.status) {
		case AudioPlayerStatus.Idle:
			connection.destroy()
			// end streaming status
		}
	});

	let connection = joinVoiceChannel({
		adapterCreator: guild.voiceAdapterCreator,
		channelId: voiceChannel.id,
		guildId: guildId,
		selfDeaf: true
	});
	connection.on('stateChange', (oldState, newState) => {
		switch (newState.status) {
		case VoiceConnectionStatus.Ready:
			let audioResource = createAudioResource('./assets/a' + 2 + '.mp3', {
				inlineVolume: true,
				inputType: StreamType.Raw
			});
			audioPlayer.play(audioResource)
		}
	});

	connection.subscribe(audioPlayer)
}