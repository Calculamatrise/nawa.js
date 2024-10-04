import trivia, { DifficultyTypes } from "../utils/trivia.js";

const triviaCooldown = new Map();
export default {
	contexts: [0, 2],
	description: "Start a round of trivia!",
	// defaultMemberPermissions: BigInt(1 << 8),
	async execute(interaction, options) {
		// let cooldown = triviaCooldown.get(interaction.user.id);
		// if (cooldown && cooldown > Date.now()) {
		// 	let seconds = Math.floor((cooldown - Date.now()) / 1e3);
		// 	return {
		// 		content: "You must wait before attempting to start another round of trivia. You're on cooldown for " + seconds + " more seconds.",
		// 		ephemeral: true
		// 	}
		// } else {
		// 	triviaCooldown.set(interaction.user.id, Date.now() + 6e4);
		// }

		let initiatedByOwner = interaction.user.id === interaction.client.application.owner.id;
		// let data = trivia.random();
		// let hints = data.hints && Array.from(data.hints);
		// let collector = interaction.channel.createMessageCollector({ dispose: true, errors: ['time'], filters: m => !m.author.bot, time: 6e4 /* set different times for diff difficulties? */ });
		// collector.on('collect', message => {
		// 	if (data.regex.test(message.content) || /^\/trivia(?!\S)/i.test(message.content)) {
		// 		collector.stop();
		// 	} else if (/(?<!\S)hint(?!\S)/i.test(message.content)) {
		// 		// reject if difficulty is not hard
		// 		let hint = data.hints ? hints.length > 0 ? hints.shift() : 'No hints remaining.' : 'No hints available in this difficulty.';
		// 		interaction.channel.send(hint)
		// 	}
		// });
		// collector.on('end', messages => {
		// 	let message = Array.from(messages.values()).find(({ content }) => data.regex.test(content));
		// 	if (!message) {
		// 		return interaction.channel.send("Round over! No one answered correctly in the time given. The correct answer is " + data.answer + ".");
		// 	}
		// 	interaction.channel.send(message.author.displayName + " won the triva round!");
		// });
		// return {
		// 	content: data.question
		// }
		let data = trivia.random();
		let thread = await interaction.reply({
			content: data.question,
			fetchReply: true
		}).then(message => {
			return typeof message.startThread == 'function' && message.startThread({
				autoArchiveDuration: 60,
				name: 'Trivia',
				reason: 'Keep the discussion for each confession organized'
			}).catch(err => console.warn('Failed to start thread', err.message)) || interaction.channel
		});
		let hints = data.hints && Array.from(data.hints);
		let collector = thread.createMessageCollector({ dispose: true, errors: ['time'], filters: m => !m.author.bot, time: 6e4 /* set different times for diff difficulties? */ });
		collector.on('collect', message => {
			if (data.regex.test(message.content) || /^\/trivia(?!\S)/i.test(message.content)) {
				collector.stop();
			} else if (/(?<!\S)hint(?!\S)/i.test(message.content)) {
				// reject if difficulty is not hard
				let hint = data.hints ? hints.length > 0 ? hints.shift() : 'No hints remaining.' : 'No hints available in this difficulty.';
				thread.send(hint)
			}
		});
		collector.on('end', async messages => {
			await thread.setLocked(true),
			await thread.setName('Trivia - Ended'),
			setTimeout(() => thread.setArchived(true).catch(err => console.warn('Failed to delete thread', err.message)), 6e4);
			let message = Array.from(messages.values()).find(({ content }) => data.regex.test(content));
			if (!message) {
				return thread.send("Round over! No one answered correctly in the time given. The correct answer is " + data.answer + ".");
			}
			thread.send(message.author.displayName + " won the triva round!");
		})
	},
	options: [{
		name: "difficulty",
		description: "Select a difficulty.",
		type: 3,
		choices: DifficultyTypes.map(difficulty => ({
			name: difficulty.replace(/^\w/, c => c.toUpperCase()),
			value: difficulty
		}))
	}]
}