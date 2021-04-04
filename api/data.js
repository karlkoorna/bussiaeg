const fs = require('fs');
const stream = require('stream');
const moment = require('moment');
const unzipper = require('unzipper');

const db = require('./db.js');
const got = require('./utils/got.js');
const log = require('./utils/log.js');

const fsp = fs.promises;

// Download data into temporary folder.
async function download() {
	log.info`Downloading data`;
	log.time('data-download');
	
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
	for (const stop of (await got('https://elron.ee/stops_data.json').json()).data) data += `${stop.peatus},${stop.latitude},${stop.longitude}\n`;
	await fsp.writeFile('tmp/elron.csv', data);
	
	log.timeEnd('data-download')`Downloaded data`;
}

// Execute scripts in folder.
async function execute(path, type) {
	for (const file of await fsp.readdir(path)) {
		const name = file.split('.')[0];
		
		log.time('data-prepare-' + name);
		if (type === 'import') log.info`Importing ${name.replace(/.*-/, '')}`;
		else log.info`Processing ${name.replace(/.*-/, '')}`;
		
		switch (file.split('.')[1]) {
			case 'sql':
				await db.query((await fsp.readFile(`${path}/${file}`)).toString());
				break;
			case 'js':
				await (require(`./${path}/${file}`))();
				break;
		}
		
		if (type === 'import') log.timeEnd('data-prepare-' + name)`Imported ${name.replace(/.*-/, '')}`;
		else log.timeEnd('data-prepare-' + name)`Processed ${name.replace(/.*-/, '')}`;
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
			log.info`Updating data`;
			log.time('data-update');
			
			await download();
			await execute('data/importers', 'import');
			await execute('data/processors', 'process');
			
			await fsp.writeFile('tmp/update', moment().add(1, 'day').hour(6).minute(0).second(0).toISOString());
			log.timeEnd('data-update')`Updated data`;
		}
	} catch (ex) {
		log.error`Failed to update data${ex}`;
	}
}

module.exports = {
	update
};
