import { AudioPlayer, AudioPlayerStatus, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import { ChannelType } from "discord.js";
import { readdirSync } from "fs";

export default class AdhanManager {
	players = new Map();
	timers = new Map();
	constructor(client) {
		Object.defineProperty(this, 'client', {
			value: client,
			writable: true
		})
	}

	_getPlayer(timezone, { expected } = {}) {
		if (this.players.has(timezone)) {
			return this.players.get(timezone);
		}

		let audioPlayer = Object.defineProperties(new AudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play }}), {
			aborted: {
				value: 0,
				writable: true
			},
			connectionsReady: {
				value: 0,
				writable: true
			},
			subscriptions: { value: new Map() }
		});
		audioPlayer.on('connectionReady', connection => {
			if (expected - audioPlayer.aborted === audioPlayer.connectionsReady) {
				audioPlayer.play(this.constructor.getAsset())
			}
		});
		audioPlayer.on('stateChange', (oldState, newState) => {
			switch (newState.status) {
			case AudioPlayerStatus.Idle:
				let subscriptions = Array.from(audioPlayer.subscriptions.values()).filter(({ connection: { state }}) => state !== VoiceConnectionStatus.Destroyed);
				for (let subscription of subscriptions)
					subscription.connection.destroy();
				audioPlayer.subscriptions.clear()
			}
		});
		this.players.set(timezone, audioPlayer);
		return audioPlayer
	}

	async addSubscriber(guildId, timezone, { expected } = {}) {
		let audioPlayer = this._getPlayer(timezone, { expected });
		let guild = await this.client.guilds.fetch(guildId);
		let voiceChannels = guild.voiceStates.cache.filter(({ channel }) => channel && channel.joinable).map(({ channel }) => channel);
		if (voiceChannels.length < 1) {
			voiceChannels = guild.channels.cache.filter(channel => (channel.type == ChannelType.GuildVoice || channel.type == ChannelType.GuildStageVoice) && channel.joinable);
			voiceChannels.sort((a, b) => a.rawPosition - b.rawPosition);
			voiceChannels = Array.from(voiceChannels.values());
			if (voiceChannels.length < 1) {
				audioPlayer.aborted++;
				return;
			}
		}

		let voiceChannel = voiceChannels[0];
		let connection = joinVoiceChannel({
			adapterCreator: guild.voiceAdapterCreator,
			channelId: voiceChannel.id,
			guildId: guildId,
			selfDeaf: true
		});
		let subscription = connection.subscribe(audioPlayer);
		audioPlayer.subscriptions.set(guildId, subscription);
		connection.on('stateChange', async (oldState, newState) => {
			switch (newState.status) {
			case VoiceConnectionStatus.Ready:
				guild.members.me.voice.suppress && await guild.members.me.voice['set' + (voiceChannel.type == ChannelType.GuildVoice ? 'Mute' : 'Suppressed')](!1);
				audioPlayer.connectionsReady++;
				audioPlayer.emit('connectionReady', connection);
				break;
			case VoiceConnectionStatus.Destroyed:
				subscription.unsubscribe()
			}
		});
	}

	static assets = readdirSync('assets/audio');
	static getAsset(key) {
		key ||= this.assets[Math.floor(this.assets.length * Math.random())];
		return createAudioResource('assets/audio/' + key, {
			inlineVolume: true,
			inputType: StreamType.Raw
		})
	}
}