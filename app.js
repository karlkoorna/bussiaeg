const fs = require('fs');
const express = require('express');
const app = express();

const ports = { http: 80, https: 443 };

require('./providers/static.js')((s) => {
	
	require('./router.js')(app, s, require('./providers/live.js'), require('./providers/panels.js'));
	
	app.use(express.static(`${__dirname}/public`));
	
	require('http').createServer(app).listen(ports.http, () => {
		console.log(`HTTP listening on ${ports.http}`);
	});
	
	try {
		
		require('https').createServer({
			cert: fs.readFileSync('ssl/ssl.crt'),
			key: fs.readFileSync('ssl/ssl.key'),
			ca: fs.readFileSync('ssl/ca.crt'),
			rejectUnauthorized: false
		}, app).listen(ports.https, () => {
			console.log(`HTTPS listening on ${ports.https}`);
		});
		
	} catch (ex) {
		console.log('HTTPS failed to start listening!');
	}
	
	scheduleUpdate(s);
	
});

// Update at 6:15 am, check every minute
function scheduleUpdate(s) {
	
	setInterval(() => {
		
		const time = new Date();
		
		if (time.getHours() === 6 && time.getMinutes() === 15) s.update(() => {
			console.log(`Updated static data: ${time}`);
		});
		
	}, 60000);
	
}
