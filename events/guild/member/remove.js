export default async function (member) {
	const entry = await this.database.guilds.fetch(member.guild.id);
	if (entry && entry.alerts.memberPart != null) {
		let channel = member.guild.channels.cache.get(entry.alerts.memberPart);
		if (!channel) {
			channel = await member.guild.channels.fetch(entry.alerts.memberPart).catch(() => {
				this.database.guilds.update(member.guild.id, {
					alerts: {
						memberPart: null
					}
				});
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
		channel.send(`**${member.user.tag}** ${recentAction ? `was ${recentAction != 22 ? 'kicked' : 'banned'} from` : 'just left'} the server.\n-# **${member.user.id}**`)
	}
}