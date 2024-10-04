const choices = [{
	name: 'Ayyām al-Bīḍ',
	value: 'ayamAlBid'
}, {
	name: 'Daily Prayers',
	value: 'adhan'
}, {
	name: 'Optional Yasum',
	value: 'yasum'
}, {
	name: 'Siyam',
	value: 'siyam'
}];

export default {
	contexts: [0, 1 /* , 2 */ ],
	defaultMemberPermissions: BigInt(1 << 5),
	description: "Manage reminders",
	options: [{
		description: "Set a reminder for yourself, or for your server",
		name: 'set',
		type: 1,
		options: [{
			name: "event",
			description: "Event for which you should be reminded",
			required: true,
			type: 3,
			choices
		}, {
			name: "mentions",
			description: "User or role that should be pinged",
			type: 9
		}, {
			name: "timezone",
			description: "Enter your city, province, and country for location-sepecific timings",
			// autocomplete: true,
			type: 3
		}]
	}, {
		description: "Unset a reminder",
		name: "unset",
		type: 1,
		options: [{
			name: "event",
			description: "Event for which you should be reminded",
			required: true,
			type: 3,
			choices
		}, {
			name: "mentions",
			description: "User or role that should be removed from pings",
			type: 9
		}]
	}]
}