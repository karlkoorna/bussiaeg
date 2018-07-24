const fse = require('fs-extra');
const got = require('got');
const unzipper = require('unzipper');
const chalk = require('chalk');

const debug = require('./utils/debug.js');
const db = require('./db.js');

// Download data into temporary folder.
function download() {
	return new Promise(async (resolve) => {
		
		debug.time('data-download', 'Downloading data');
		
		// Download and extract GTFS data into temporary folder.
		await got.stream('http://peatus.ee/gtfs/gtfs.zip').pipe(unzipper.Extract({ path: 'tmp' })).promise();
		
		// Correct GTFS filetypes.
		for (const file of await fse.readdir('tmp')) await fse.rename(`tmp/${file}`, `tmp/${file.substr(0, file.lastIndexOf('.'))}.csv`);
		
		// Download and write Elron stop data into temporary folder.
		let data = 'name,desc,lat,lng\n';
		for (const stop of JSON.parse((await got('https://elron.ee/api/v1/stops')).body).data) data += `${stop.peatus},${stop.teade},${stop.latitude},${stop.longitude}\n`;
		await fse.writeFile('tmp/elron.csv', data);
		
		debug.timeEnd('data-download', 'Downloaded data');
		resolve();
		
	});
};

// Run all SQL files in a folder.
function prepare(path, msgIncomplete, msgComplete) {
	return new Promise(async (resolve) => {
		
		for (const file of await fse.readdir(path)) {
			
			const name = file.split('.')[0];
			
			debug.time(`data-prepare-${name}`, `${msgIncomplete} ${chalk.blue(name)}`);
			
			switch (file.split('.')[1]) {
				
				case 'sql': {
					await db.query((await fse.readFile(`${path}/${file}`)).toString());
					break;
				}
				
				case 'js': {
					await (require(`./${path}/${file}`))();
					break;
				}
				
			}
			
			debug.timeEnd(`data-prepare-${name}`, `${msgComplete} ${chalk.blue(name)}`);
			
		}
		
		resolve();
		
	});
}

// Start data update.
function update() {
	return new Promise(async (resolve) => {
		
		// Update data in production only.
		if (process.env['NODE_ENV'] !== 'development') {
			
			debug.info('Starting data update');
			debug.time('data-update');
			
			await download();
			await prepare('sql/importers', 'Importing', 'Imported');
			await prepare('sql/generators', 'Generating', 'Generated');
			
			debug.timeEnd('data-update', 'Data update completed');
			
		}
		
		resolve();
		
	});
};

module.exports = {
	update
};
