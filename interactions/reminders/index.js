const choices = [{
	name: 'Ayyām al-Bīḍ',
	value: 'BID'
}, {
	name: 'Daily Prayers',
	value: 'ALL'
}, {
	name: 'Optional Yasum',
	value: 'YSM'
}, {
	name: 'Siyam',
	value: 'SYM'
}];

export default {
	description: "Manage reminders.",
	options: [{
		description: "Set a reminder for yourself, or for your server.",
		name: 'set',
		type: 1,
		options: [{
			name: "event",
			description: "Event for which you should be reminded.",
			type: 3,
			choices
		}, {
			name: "location",
			description: "Enter your city, province, and country for location-sepecific timings.",
			type: 3
		}]
	}, {
		description: "Unset a reminder.",
		name: 'unset',
		type: 1,
		options: [{
			name: "event",
			description: "Event for which you should be reminded.",
			type: 3,
			choices
		}]
	}]
}