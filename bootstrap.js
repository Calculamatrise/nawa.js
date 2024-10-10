import Client from "./client/Client.js";
import { GatewayIntentBits, Partials } from "discord.js";
import config from "./utils/env.js";

export const client = new Client({
	allowedMentions: {
		parse: [
			'users',
			'roles'
		],
		repliedUser: true
	},
	intents: [
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Channel, // Required to receive DMs
		Partials.GuildMember
	],
	presence: {
		afk: true,
		status: 'idle',
		activities: [{
			name: "كلمة الله",
			type: 2
		}]
	}
});

await config();

client.login(process.env.TOKEN)