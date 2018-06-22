const fs = require('fs');
const got = require('got');
const unzipper = require('unzipper');
const chalk = require('chalk');

const debug = require('./utils/debug.js');

const db = require('./db.js');

// Update GTFS data.
async function update(cb) {
	
	debug.info('Starting data update');
	debug.time('update');
	debug.time('data', 'Downloading data');
	
	// Download GTFS ZIP file.
	const res = await got.stream('http://peatus.ee/gtfs/gtfs.zip');
	
	debug.timeEnd('data', 'Downloaded data');
	debug.time('extract', 'Extracting data');
	
	// Extract GTFS ZIP file into temporary folder.
	await res.pipe(unzipper.Extract({ path: 'tmp' })).promise();
	
	debug.timeEnd('extract', 'Extracted data');
	
	// Import data from files.
	fs.readdir('sql/importers', (err, files) => {
		
		next(0);
		function next(i) {
			
			if (i > files.length - 1) {
				debug.timeEnd('update', 'Data update completed');
				return void (cb ? cb() : null);
			}
			
			const file = files[i];
			const name = file.slice(0, -4);
			
			debug.time(name, `Importing ${name}`);
			
			fs.readFile(`sql/importers/${file}`, (err, data) => {
				
				db.query(data.toString(), (err) => {
					debug.timeEnd(name, `Imported ${name}`);
					next(i + 1);
				});
				
			});
			
		}
		
	});
	
};

module.exports.update = update;
