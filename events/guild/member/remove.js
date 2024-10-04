export default async function (member) {
	const entry = await this.database.guilds.fetch(member.guild.id);
	if (!entry || !entry.alerts || !entry.alerts.memberPart) return;
	const config = typeof entry.alerts.memberPart == 'object' ? entry.alerts.memberPart : { channelId: entry.alerts.memberPart };
	let channel = member.guild.channels.cache.get(config.channelId);
	if (!channel) {
		channel = await member.guild.channels.fetch(config.channelId).catch(() => {
			this.database.guilds.delete(member.guild.id, { alerts: ['memberPart'] })
		});
		if (!channel) {
			return;
		}
	}

	let recentAction = await member.guild.fetchAuditLogs({
		limit: 1
	}).then(({ entries }) => entries.size > 0 && entries.values().next().value).then(entry => {
		return entry.targetId == member.user.id && member.joinedTimestamp < entry.createdTimestamp && (entry.action == 20 || entry.action == 22) && entry.action
	}).catch(({ message }) => {
		console.error('GuildMemberRemove:', message)
	});
	channel.send((!recentAction && config.customMessage) ? config.customMessage.replace(/{user}/gi, member.user.username).replace(/{server}/gi, member.guild.name) : `**${member.user.tag}** ${recentAction ? `was ${recentAction != 22 ? 'kicked' : 'banned'} from` : 'just left'} the server.\n-# **${member.user.id}**`)
}