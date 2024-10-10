import { existsSync, readFile } from "fs";

export default config;
export function config() {
	if (!existsSync('.env')) return Promise.reject('.env not found');
	return new Promise((resolve, reject) => {
		readFile('.env', (err, data) => {
			if (err !== null) reject(err);
			const content = data.toString();
			if (content.length > 0) {
				for (const match of content.split('\n')) {
					const [key, value] = match.split(/[\s=]+/, 2);
					if (!key || !value) continue;
					process.env[key] = value;
				}
			}
			resolve(process.env)
		})
	})
}

export function configSync() {
	if (!existsSync('.env')) return null;
	return new Promise((resolve, reject) => {
		readFile('.env', (err, data) => {
			if (err !== null) reject(err);
			const content = data.toString();
			if (content.length > 0) {
				for (const match of content.split('\n')) {
					const [key, value] = match.split(/[\s=]+/, 2);
					if (!key || !value) continue;
					process.env[key] = value;
				}
			}
			resolve(process.env)
		})
	})
}