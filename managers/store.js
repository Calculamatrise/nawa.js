export default class {
	#channel = null;
	#clientId = null;
	#defaults = null;
	#defaultMessageId = null;
	#messages = null;
	cache = new Map();
	constructor(channel, clientId, defaults) {
		this.#channel = channel;
		this.#clientId = clientId;
		typeof defaults == 'object' && defaults != null && this.#createDefaults(defaults);
	}
	async #createDefaults(defaults) {
		let channel = this.#channel;
		let filter = message => message.author.id === this.#clientId;
		let messages = channel.messages.cache.filter(filter);
		if (messages.size < 1) {
			messages = await channel.messages.fetch();
			if (messages.size > 0) {
				messages = messages.filter(filter);
			}
		}

		messages = Array.from(messages.values());
		messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
		let message = messages[0];
		if (message) {
			let content = message.content;
			if (content.startsWith('`')) {
				let savedDefaults = JSON.parse(content.replace(/^`{3}json|`{3}$/gi, ''));
				if (defaults) {
					Object.assign(savedDefaults, defaults);
					let newContent = '```JSON\n' + JSON.stringify(savedDefaults, null, 4) + '```';
					if (newContent !== content) {
						await message.edit(newContent);
					}
				}

				defaults = savedDefaults;
			}
		} else if (defaults) {
			message = await channel.send('```JSON\n' + JSON.stringify(defaults, null, 4) + '```');
		}

		message && (this.#defaultMessageId = message.id);
		return this.#defaults = defaults
	}
	async #createEntry(data) {
		if (typeof data != 'object') {
			throw new TypeError("Entry is not an object.")
		}

		let channel = this.#channel;
		let entry = await channel.send(JSON.stringify(data));
		this.#messages ||= [];
		this.#messages.unshift(entry);
		return entry
	}
	async #findEntry(key, fallback) {
		if (!key) {
			throw new TypeError("Key must be a string, or a number greater than 0.");
		}
		let entries = await this.entries();
		let entry = entries.find(entry => {
			let data = JSON.parse(entry.content);
			return data.hasOwnProperty(key)
		});
		return entry || (fallback && entries[0])
	}
	async #findAndParseEntry(key) {
		let entry = await this.#findEntry(key);
		return (entry && JSON.parse(entry.content)) ?? null
	}
	async entries() {
		if (this.#messages !== null) {
			return this.#messages;
		}

		let channel = this.#channel;
		let filter = message => message.author.id === this.#clientId && message.id !== this.#defaultMessageId && /^{|}$/gi.test(message.content);
		let messages = channel.messages.cache.filter(filter);
		if (messages.size < 1) {
			messages = await channel.messages.fetch().then(messages => {
				return messages.filter(filter)
			})
			if (messages.size < 1) {
				return [];
			}
		}

		messages = Array.from(messages.values()).sort((a, b) => a.content.length - b.content.length);
		this.#messages = messages;
		this.cache = new Map(this.#messages.reduce((combined, entry) => combined.concat(Object.entries(JSON.parse(entry.content))), []));
		return messages
	}
	create = this.update;
	async fetch(key, { force } = {}) {
		if (!force && this.cache.has(key)) {
			return this.cache.get(key);
		}
		let entry = await this.#findAndParseEntry(key);
		return (entry && entry[key]) ?? null
	}
	async has(key) {
		return null !== await this.fetch(key)
	}
	async set(key, value) {
		let message = await this.#findEntry(key, true);
		let data = message ? JSON.parse(message.content) : {};
		let newValue = Object.assign({}, this.#defaults, value);
		if (JSON.stringify(data[key]) !== JSON.stringify(newValue)) {
			data[key] = newValue;
			this.cache.set(key, newValue);
			if (message) {
				let content = JSON.stringify(data);
				if (content.length > 2e3) {
					delete data[key];
					await this.#createEntry({ [key]: newValue });
				}

				message.content !== content && await message.edit(JSON.stringify(data));
			} else {
				await this.#createEntry(data);
			}
		}

		return newValue
	}
	async update(key, value) {
		return this.set(key, Object.assign({}, this.#defaults, merge(Object.assign({}, await this.fetch(key)), value)))
	}
	async delete(key, properties) {
		let entry = await this.#findEntry(key);
		if (entry) {
			let data = JSON.parse(entry);
			if (properties instanceof Object) {
				for (let property in properties) {
					if (data[key].hasOwnProperty(property)) {
						delete data[key][property];
					}
				}
			} else if (typeof properties == 'string' && data[key].hasOwnProperty(properties)) {
				delete data[key][property];
			}

			let keys = Object.keys(data[key]);
			if (keys.length < 1 || !properties) {
				delete data[key];
				this.cache && this.cache.delete(key);
			} else {
				this.cache ||= new Map();
				this.cache.set(key, data[key]);
			}

			keys = Object.keys(data);
			if (keys.length > 0) {
				await entry.edit(JSON.stringify(data));
			} else {
				await entry.delete();
			}
			return true;
		}

		return false
	}
	async destroy() {
		await this.#channel.delete();
		this.#channel = null;
		this.#defaults = null;
		this.#defaultMessageId = null;
		this.#messages = null;
		this.cache = null
	}
}

function merge(parent, object) {
	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			if (parent[key] instanceof Object) {
				parent[key] = merge(parent[key], object[key]);
				continue;
			}

			parent[key] = object[key];
		}
	}

	return parent
}