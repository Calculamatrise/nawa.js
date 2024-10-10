export default class Adhan {
	address = null;
	passed = !1;
	date = new Date();
	prayer = null;
	time = null;
	timestamp = null;
	timezone = null;
	constructor(info) {
		for (let key of Object.getOwnPropertyNames(this)) {
			if (key in info) {
				this[key] = info[key];
			}
		}

		Object.defineProperty(this, 'address', { enumerable: !1 })
	}

	get hoursRemaining() {
		return Math.floor(this.minutesRemaining / 60)
	}

	get minutesRemaining() {
		return Math.floor(this.date.getTime() / 6e4 - this.constructor.localDate(this.timezone).getTime() / 6e4)
	}

	get offset() {
		return Math.floor(this.date.getTime() / 8.64e7 - this.constructor.localDate(this.timezone).getTime() / 8.64e7)
	}

	get timeRemaining() {
		let string = ''
		  , hoursRemaining = this.hoursRemaining
		  , minutesRemaining = this.minutesRemaining % 60;
		hoursRemaining > 0 && (string += hoursRemaining + ' hour',
		hoursRemaining > 1 && (string += 's'));
		minutesRemaining > 0 && (string.length > 0 && (string += ' and '),
		string += minutesRemaining + ' minute',
		minutesRemaining > 1 && (string += 's'));
		return string + ' remaining'
	}

	next() {
		return this.constructor.next(this.timezone)
	}

	static _calculateMinutesRemaining(time, { date, offsetDate = 0 }) {
		let [hour, minute] = time.match(/\d+/g);
		let minutes = parseInt(hour) * 60 + parseInt(minute);
		let currentMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
		let minutesRemaining = minutes + offsetDate * 1440 - currentMinutes % 1440;
		return minutesRemaining
	}

	static async _fetchCalendar(date, address, { offsetMonth } = {}) {
		offsetMonth && (date = new Date(date.getTime()),
		date.setMonth(date.getMonth() + offsetMonth));
		return fetch("https://api.aladhan.com/v1/calendarByAddress/" + date.getFullYear() + "/" + (1 + date.getMonth()) + "?" + new URLSearchParams({ address }).toString()).then(r => r.json()).then(async ({ code, data }) => {
			if (code !== 200) {
				throw new Error(data);
			} else if (!offsetMonth && data.length <= date.getDate()) {
				data = await this._fetchCalendar(...arguments, { offsetMonth: 1 }).then(next => {
					return next.slice(0, date.getDate() - 1).concat(...data.slice(date.getDate() - 1))
				});
			}
			return data
		})
	}

	static prayers = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA'];
	static async fetch(prayer) {
		if (typeof prayer == 'string') {
			prayer = this.toPrayer(prayer);
			return this.timings(Object.assign({}, Array.prototype.slice.call(arguments, 1), { prayer })).then(timings => {
				if (!timings.hasOwnProperty(prayer)) {
					throw new Error("Unrecognized prayer code: " + prayer);
				}
				return timings[prayer]
			});
		}

		return this.timings(...arguments)
	}

	static async current(address) {
		let timings = await this.timings({ address, appendNext: true, filterExpired: true });
		return Object.values(timings).find(prayer => prayer.minutesRemaining < 0 && !prayer.passed)
	}

	static async next(address) {
		let timings = await this.timings({ address, appendNext: true, filterExpired: true });
		return Object.values(timings).find(prayer => prayer.minutesRemaining > 0)
	}

	static async parseTimezone(address) {
		if (typeof address != 'string') return null;
		else if (this.verifyTimezone(address)) return address;
		return fetch("https://api.aladhan.com/v1/timingsByAddress/" + new Date().toLocaleString('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		}).split('-').reverse().join('-') + "?" + new URLSearchParams({ address }).toString()).then(r => r.json()).then(async ({ code, data }) => {
			if (code !== 200) {
				throw new Error(data);
			}
			return data.meta.timezone
		})
	}

	static async timings({ address, appendNext, filterExpired, filter, filterPrayers = true, offsetDate = 0, prayer, timezone } = {}) {
		let date = this.localDate(timezone || await this.parseTimezone(address));
		offsetDate && date.setDate(date.getDate() + offsetDate);
		return this._fetchCalendar(date, address).then(data => {
			offsetDate && date.setDate(date.getDate() - offsetDate);
			let time = date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				hourCycle: 'h23',
				minute: '2-digit',
				timeZone: 'UTC'
			});
			let today = data[date.getDate() - 1];
			let timings = today.timings;
			filterPrayers && (timings = this.filterNonDailyPrayers(timings));
			let remaining = this.filterPassedTimes(timings, time);
			prayer && !remaining[this.toPrayer(prayer)] && (remaining = {});
			Object.keys(remaining).length > 0 ? filterExpired && (timings = remaining,
			Object.keys(remaining).length < 5 && appendNext && (today = data[date.getDate() % data.length],
			Object.assign(timings, Object.fromEntries(Object.entries(this.filterNonDailyPrayers(today.timings)).filter(([key]) => !timings.hasOwnProperty(key)))))) : (offsetDate += 1,
			today = data[(date.getDate() - 1 + offsetDate) % data.length],
			timings = this.filterNonDailyPrayers(today.timings));
			return Object.fromEntries(Object.entries(timings).map(([key, value]) => {
				let timeRemaining = this._calculateMinutesRemaining(value, {
					date,
					offsetDate: key.toUpperCase() === 'ISHA' ? offsetDate++ : offsetDate
				});
				return [key, new this({
					address,
					date: new Date(date.getTime() + timeRemaining * 6e4),
					prayer: key,
					time: value,
					timezone: today.meta.timezone
				})]
			}).map(([key, value], index, arr) => {
				let next = arr[(index + 1) % arr.length];
				return [key, Object.assign(value, {
					passed: value.minutesRemaining < 0 && next && next[1].minutesRemaining < 0
				})]
			}))
		})
	}

	static filterNonDailyPrayers(timings) {
		return Object.fromEntries(Object.entries(timings).filter(([key]) => this.prayers.includes(key.toUpperCase())))
	}

	static filterPassedTimes(timings, time) {
		let entries = Object.entries(timings).reverse();
		return Object.fromEntries(entries.filter(([,value], index) => (value.time || value) > time || (entries[index - 1] && (entries[index - 1][1].time || entries[index - 1][1]) > time)).reverse())
	}

	static localDate(timeZone) {
		let date = this.offsetDate(...Array.prototype.slice.call(arguments, 1));
		date.setTime(Date.parse(date.toLocaleString('en-US', { timeZone })));
		return date
	}

	static offsetDate(base = Date.now()) {
		let date = new Date(base);
		date.setTime(date.getTime() - date.getTimezoneOffset() * 6e4);
		return date
	}

	static toPrayer(string) {
		return string.toLowerCase().replace(/^\w/, c => c.toUpperCase())
	}

	static verifyTimezone() {
		try {
			new Date().toLocaleString('en-US', { timeZone: address });
			return !0
		} catch {
			return !1
		}
	}

	static wikiPrayer(prayer) {
		return "[" + prayer + "](<https://en.wikipedia.org/wiki/" + prayer.replace(/^dh?uhr$/i, 'Zuhr') + "_prayer>)"
	}
}