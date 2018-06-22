const fs = require('fs');
const got = require('got');
const unzipper = require('unzipper');
const chalk = require('chalk');

const debug = require('./utils/debug.js');

const db = require('./db.js');

// Download data.
function downloadData() {
	return new Promise(async (resolve) => {
		
		debug.info('Starting data update');
		debug.time('data-update');
		debug.time('data-download', 'Downloading data');
		
		// Download and extract GTFS ZIP file to temporary folder.
		const res = await got.stream('http://peatus.ee/gtfs/gtfs.zip').pipe(unzipper.Extract({ path: 'tmp' })).promise();
		
		debug.timeEnd('data-download', 'Downloaded data');
		
		resolve();
		
	});
};

// Import data to database.
function importData() {
	return new Promise((resolve) => {
			
		// Enumerate importers.
		fs.readdir('sql/importers', (err, files) => {
			
			next(0);
			function next(i) {
				
				// Return early if finished.
				if (i > files.length - 1) return void resolve();
				
				const file = files[i];
				const name = file.slice(0, -4);
				
				debug.time(`data-import-${name}`, `Importing ${chalk.blue(name)}`);
				
				// Run importer.
				fs.readFile(`sql/importers/${file}`, (err, data) => {
					db.query(data.toString(), () => {
						debug.timeEnd(`data-import-${name}`, `Imported ${chalk.blue(name)}`);
						next(i + 1);
					});
				});
				
			}
			
		});
		
	});
}

// Generate additional data from imported data.
function generateData() {
	return new Promise((resolve) => {
		
		// Enumerate generators.
		fs.readdir('sql/generators', (err, files) => {
			
			next(0);
			function next(i) {
				
				// Return early if finished.
				if (i > files.length - 1) return void resolve();
				
				const file = files[i];
				const name = file.slice(0, -4);
				
				debug.time(`data-generate-${name}`, `Generating ${chalk.blue(name)}`);
				
				// Run importer.
				fs.readFile(`sql/generators/${file}`, (err, data) => {
					db.query(data.toString(), () => {
						debug.timeEnd(`data-generate-${name}`, `Generated ${chalk.blue(name)}`);
						next(i + 1);
					});
				});
				
			}
			
		});
		
	});
}

function update() {
	return new Promise(async (resolve) => {
		
		await downloadData();
		await importData();
		await generateData();
		
		debug.timeEnd('data-update', 'Data update completed');
		resolve();
		
	});
};

module.exports = {
	update
};
