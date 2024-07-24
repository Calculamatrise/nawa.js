import trivia, { DifficultyTypes } from "../utils/trivia.js";

const random = arr => arr[Math.floor(arr.length * Math.random())];
const triviaCooldown = new Map();
export default {
	description: "Start a round of trivia!",
	defaultMemberPermissions: BigInt(1 << 8),
	dmPermission: false,
	async execute(interaction) {
		// let cooldown = triviaCooldown.get(message.author.id);
		// if (cooldown && cooldown > Date.now()) {
		// 	let seconds = Math.floor((cooldown - Date.now()) / 1e3);
		// 	return message.reply("You must wait before attempting to start another round of trivia. You're on cooldown for " + seconds + " more seconds.").catch(err => {
		// 		return message.dialogue.send(err.message || "Something went wrong! Please try again later.");
		// 	});
		// } else {
		// 	triviaCooldown.set(message.author.id, Date.now() + 6e4);
		// }
		// // https://the-trivia-api.com/api/questions?categories=society_and_culture&limit=1&difficulty=medium&tags=islam
		// let initiatedByOwner = message.author.id === "s8LQFAyBUo";
		// // Add easter egg "What is cal's favourite emoji?";
		// if (args[0] === 'beta') {
		// 	let data = trivia.random();
		// 	return message.reply(data.question).then(msg => {
		// 		return message.dialogue.messages.await({ errors: ['time'], filter: m => m.dialogueId == message.dialogueId, /* maxProcessed: 1 */ time: 6e4 }, message => {
		// 			if (data.regex.test(message.content)) {
		// 				return 0;
		// 			} else if (/^\/trivia(?!\S)/i.test(message.content)) {
		// 				return 0;
		// 			} else if (/(?<!\S)hint(?!\S)/i.test(message.content)) {
		// 				// reject if difficulty is not hard
		// 				let hint = data.hints ? data.hints.length > 0 ? hints.shift() : 'No hints remaining.' : 'No hints available in this difficulty.';
		// 				message.dialogue.send(hint)
		// 			}
		// 		}).then(messages => {
		// 			let msg = Array.from(messages.values()).find(({ content }) => data.regex.test(content));
		// 			if (!msg) {
		// 				throw new Error("Round over! No one answered correctly in the time given. The correct answer is " + data.answer + ".");
		// 			}
		// 			return message.dialogue.send(msg.author.displayName + " won the triva round!")
		// 		}).catch(err => {
		// 			if (err instanceof Map) {
		// 				let msg = Array.from(err.values()).find(({ content }) => data.regex.test(content));
		// 				if (!msg) {
		// 					err = new Error("Round over! No one answered correctly in the time given. The correct answer is " + data.answer + ".");
		// 				}
		// 			}
		// 			return message.dialogue.send(err.message || "Something went wrong! Please try again later.")
		// 		})
		// 	});
		// }
		// return fetch("https://the-trivia-api.com/api/questions?categories=society_and_culture&limit=1&difficulty=" + random(['medium', 'hard']) + "&tags=islam").then(r => r.json()).then(([data]) => {
		// 	let hints = data.incorrectAnswers;
		// 	return message.reply(data.question).then(msg => {
		// 		return message.dialogue.messages.await({ errors: ['time'], filter: m => m.dialogueId == message.dialogueId, /* maxProcessed: 1 */ time: 6e4 }, message => {
		// 			if (message.content.toLowerCase().includes(data.correctAnswer.toLowerCase())) {
		// 				return 0;
		// 			} else if (/^\/trivia(?!\S)/i.test(message.content)) {
		// 				return 0;
		// 			} else if (/(?<!\S)hint(?!\S)/i.test(message.content)) {
		// 				let hint = hints.length > 0 ? hints.shift() : 'No hints remaining.';
		// 				message.dialogue.send(hint)
		// 			}
		// 		}).then(messages => {
		// 			let msg = Array.from(messages.values()).find(({ content }) => content.toLowerCase().includes(data.correctAnswer.toLowerCase()));
		// 			if (!msg) {
		// 				throw new Error("Round over! No one answered correctly in the time given. The correct answer is " + data.correctAnswer + ".");
		// 			}
		// 			return message.dialogue.send(msg.author.displayName + " won the triva round!")
		// 		}).catch(err => {
		// 			if (err instanceof Map) {
		// 				let msg = Array.from(err.values()).find(({ content }) => content.toLowerCase().includes(data.correctAnswer.toLowerCase()));
		// 				if (!msg) {
		// 					err = new Error("Round over! No one answered correctly in the time given. The correct answer is " + data.correctAnswer + ".");
		// 				}
		// 			}
		// 			return message.dialogue.send(err.message || "Something went wrong! Please try again later.")
		// 		})
		// 	})
		// }).catch(err => {
		// 	return message.dialogue.send(err.message || "Something went wrong! Please try again later.");
		// })
		// // return message.dialogue.messages.await({ filter: m => m.dialogueId == message.dialogueId, maxProcessed: 1 }).then(r => {
		// // 	console.log(r)
		// // }).catch(err => {
		// // 	return message.dialogue.send(err.message || "Something went wrong! Please try again later.");
		// // })
		return {
			content: 'Unfinished.',
			ephemeral: true
		}
	}
}