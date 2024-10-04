import EventEmitter from "events";

export default class Adhan extends EventEmitter {
	_location = null;
	_timeout = null;
	constructor(location /* info */) {
		Object.defineProperty(this, '_location', { value: location, enumerable: false }),
		Object.defineProperty(this, '_timeout', { enumerable: false }),
		this._start()
	}

	async _start() {
		const nextPrayer = await this.constructor.next(this._location);
		nextPrayer && (this._timeout && clearTimeout(this._timeout),
		this._timeout = setTimeout(this.emit.bind(this), nextPrayer.timeRemaining * 6e4, 'call', nextPrayer))
	}

	static _calculateMinutesRemaining(time, { date, offsetDate = 0 }) {
		let [hour, minute] = time.match(/\d+/g);
		let minutes = parseInt(hour) * 60 + parseInt(minute);
		let currentMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
		let minutesRemaining = minutes + offsetDate * 1440 - currentMinutes % 1440;
		return minutesRemaining
	}

	static async _fetchTimings(date, address, { offsetMonth } = {}) {
		offsetMonth && (date = new Date(date.getTime()),
		date.setMonth(date.getMonth() + offsetMonth));
		return fetch("https://api.aladhan.com/v1/calendarByAddress/" + date.getFullYear() + "/" + (1 + date.getMonth()) + "?" + new URLSearchParams({
			address
		}).toString()).then(r => r.json()).then(async ({ code, data }) => {
			if (code !== 200) {
				throw new Error(data);
			} else if (!offsetMonth && data.length <= date.getDate()) {
				data = await this._fetchTimings(...arguments, { offsetMonth: 1 }).then(next => {
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
		return Object.values(timings).find(prayer => prayer.timeRemaining < 0 && !prayer.passed)
	}

	static async next(address) {
		let timings = await this.timings({ address, appendNext: true, filterExpired: true });
		return Object.values(timings).find(prayer => prayer.timeRemaining > 0)
	}

	static async timings({ address, appendNext, filterExpired, filter, filterPrayers = true, offsetDate = 0, prayer } = {}) {
		let date = new Date();
		date.setTime(date.getTime() - date.getTimezoneOffset() * 6e4),
		offsetDate && date.setDate(date.getDate() + offsetDate);
		return this._fetchTimings(date, address).then(data => {
			offsetDate && date.setDate(date.getDate() - offsetDate),
			date.setTime(Date.parse(date.toLocaleString('en-US', { timeZone: data[0].meta.timezone })));
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
				return [key, {
					address,
					offset: offsetDate,
					prayer: key,
					time: value,
					timeRemaining: this._calculateMinutesRemaining(value, {
						date,
						offsetDate: key.toUpperCase() === 'ISHA' ? offsetDate++ : offsetDate
					})
				}]
			}).map(([key, value], index, arr) => {
				let next = arr[(index + 1) % arr.length];
				return [key, Object.assign(value, {
					passed: value.timeRemaining < 0 && next && next[1].timeRemaining < 0
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

	static toPrayer(string) {
		return string.toLowerCase().replace(/^\w/, c => c.toUpperCase())
	}
}