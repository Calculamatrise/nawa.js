import { createCanvas, loadImage } from "canvas";

const canvas = createCanvas(800, 300);
const ctx = canvas.getContext('2d');

export default async function (member) {
	const entry = await this.database.guilds.fetch(member.guild.id);
	if (!entry || !entry.alerts || !entry.alerts.memberJoin) return;
	const config = typeof entry.alerts.memberJoin == 'object' ? entry.alerts.memberJoin : { channelId: entry.alerts.memberJoin };
	config.customMessage ||= "Welcome to {server}!";
	let channel = member.guild.channels.cache.get(config.channelId)
	if (!channel) {
		channel = await member.guild.channels.fetch(config.channelId).catch(() => {
			this.database.guilds.delete(member.guild.id, { alerts: ['memberJoin'] })
		});
		if (!channel) {
			return;
		}
	}

	const avatar = await loadImage(member.user.displayAvatarURL({ format: 'jpg', size: 256 }).replace(/\.webp(\?.*)?$/, '.jpg?size=256'))
		, banner = await loadImage(member.guild.bannerURL() || 'assets/banner.png');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const avatarSize = Math.min(canvas.width, canvas.height) / 1.35;
	avatar && ctx.drawImage(avatar, canvas.width - avatarSize * 1.175, canvas.height / 2 - avatarSize / 2, avatarSize, avatarSize),
	banner && ctx.drawImage(banner, 0, 0, canvas.width, canvas.height),
	// avatar && (ctx.save(),
	// ctx.arc(canvas.width - avatarSize / 1.475, canvas.height / 2, avatarSize / 2.175, 0, 2 * Math.PI, !0),
	// ctx.clip(),
	// ctx.drawImage(avatar, canvas.width - avatarSize * 1.175, canvas.height / 2 - avatarSize / 2, avatarSize, avatarSize),
	// ctx.restore()),
	ctx.fillStyle = 'white',
	ctx.font = "bold 30px Arial",
	ctx.fillText(member.user.username, 190, canvas.height / 2 - 16),
	ctx.fillStyle = '#eee',
	ctx.font = "20px Arial";
	ctx.fillText(getLines(ctx, config.customMessage.replace(/{user}/gi, member.user.username).replace(/{server}/gi, member.guild.name), canvas.width / 2.5).join('\n'), 190, canvas.height / 2 + 16);
	await channel.send({
		content: `**${member.user.tag}** just joined the server!`,
		files: [{
			attachment: canvas.toBuffer(),
			name: 'welcome.png'
		}]
	})
}

function getLines(ctx, text, maxWidth) {
	var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}