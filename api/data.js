const fs = require('fs');
const stream = require('stream');
const chalk = require('chalk');
const moment = require('moment');
const got = require('got');
const unzipper = require('unzipper');

const db = require('./db.js');
const debug = require('./utils/debug.js');

const fsp = fs.promises;

// Download data into temporary folder.
async function download() {
	debug.time('data-download', 'Downloading data');
	
	// Download and extract MNT data into temporary folder.
	await new Promise((resolve) => {
		got.stream('http://peatus.ee/gtfs/gtfs.zip')
			.pipe(unzipper.Parse())
			.pipe(stream.Transform({
				objectMode: true,
				transform(entry, e, cb) {
					entry.pipe(fs.createWriteStream(`tmp/${entry.path.split('.')[0]}.csv`)).on('finish', cb);
				}
			})).on('finish', resolve);
	});
	
	// Download and write Elron stop data into temporary folder.
	let data = 'name,lat,lng\n';
	for (const stop of JSON.parse((await got('https://elron.ee/api/v1/stops')).body).data) data += `${stop.peatus},${stop.latitude},${stop.longitude}\n`;
	await fsp.writeFile('tmp/elron.csv', data);
	
	debug.timeEnd('data-download', 'Downloaded data');
}

// Execute scripts in folder.
async function execute(path, msgIncomplete, msgComplete) {
	for (const file of await fsp.readdir(path)) {
		const name = file.split('.')[0];
		
		debug.time('data-prepare-' + name, msgIncomplete + ' ' + chalk.white(name));
		
		switch (file.split('.')[1]) {
			case 'sql':
				await db.query((await fsp.readFile(`${path}/${file}`)).toString());
				break;
			case 'js':
				await (require(`./${path}/${file}`))();
				break;
		}
		
		debug.timeEnd('data-prepare-' + name, msgComplete + ' ' + chalk.white(name));
	}
}

// Update data.
async function update() {
	try {
		let nextUpdate;
		
		try {
			await fsp.stat('tmp/update');
			nextUpdate = (await fsp.readFile('tmp/update')).toString();
		} catch {}
		
		// Update stale data.
		if (!nextUpdate || new Date(nextUpdate) <= new Date()) {
			debug.info('Starting data update');
			debug.time('data-update');
			
			await download();
			await execute('data/importers', 'Importing', 'Imported');
			await execute('data/processors', 'Generating', 'Generated');
			
			await fsp.writeFile('tmp/update', moment().add(1, 'day').hour(6).minute(0).second(0).toDate());
			debug.timeEnd('data-update', 'Data update completed');
		}
	} catch (ex) {
		debug.error('Failed to update data', ex);
	}
}

module.exports = {
	update
};
