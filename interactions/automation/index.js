const choices = [{
	name: 'Member Join',
	value: 'memberJoin'
}, {
	name: 'Member Leave',
	value: 'memberPart'
}, {
	name: 'Server Boost',
	value: 'memberBoost'
}];

export default {
	contexts: [0],
	defaultMemberPermissions: BigInt(1 << 5),
	description: "Configure automated actions.",
	options: [{
		name: "enable",
		description: "Enable an automated feature",
		type: 1,
		options: [{
			name: "event",
			description: "Event for which an automation should be created",
			required: true,
			type: 3,
			choices
		}, {
			name: "message",
			description: "Set a custom message ({user} to reference the user's name and {server} for the server name)",
			type: 3
		} /* , {
			name: "theme",
			description: "Pick a theme for the banner image",
			type: 3,
			choices: [] // fetch assets folder files
		}, {
			name: "style",
			description: "Pick between the two theme styles for the banner image",
			type: 3,
			choices: [{
				name: "Default",
				value: ""
			}, {
				name: "Underlay",
				value: "-alt"
			}]
		} */]
	}, {
		name: "disable",
		description: "Disable an automated feature",
		type: 1,
		options: [{
			name: "event",
			description: "Event for which an automation should be created",
			type: 3,
			choices
		}]
	}]
}