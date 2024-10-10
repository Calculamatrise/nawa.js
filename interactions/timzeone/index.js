export default {
	contexts: [0, 1 /* , 2 */ ],
	defaultMemberPermissions: BigInt(1 << 5),
	description: "Manage timezones",
	options: [{
		description: "Set the timezone for yourself, or for your server",
		name: 'set',
		type: 1,
		options: [{
			name: "timezone",
			description: "Enter your city, province, and country for location-sepecific timings",
			autocomplete: true,
			required: true,
			// choices: [{name: 'UTC-8'}, {}],
			type: 3
		}]
	}, {
		description: "Unset the timezone for your self/server",
		name: "unset",
		type: 1
	}]
}