export default {
	description: "Configure automated actions.",
	defaultMemberPermissions: BigInt(1 << 5),
	dmPermission: false,
	options: [{
		name: "adhan-notification",
		description: "Pings a role for the adhan",
		type: 1,
		options: [{
			name: "role",
			description: "A role that should be pinged upon adhan.",
			type: 8
		}, {
			name: "location",
			description: "Specify a location to get an accurate timezone.",
			type: 3
		}]
	}, {
		name: "toggle-join-notification",
		description: "Welcome new members w/ a banner!",
		type: 1
	}, {
		name: "toggle-leave-notification",
		description: "Receive notifications when a member leaves the server",
		type: 1
	}]
}