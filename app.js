const express = require('express'), app = express();
const fs = require('fs');

const port = { http: 80, https: 443 };

require('./providers/static.js')((s) => {
	
	require('./router.js')(app, s, require('./providers/live.js'), require('./providers/panels.js'));
	
	app.use(express.static(__dirname + '/public'));
	
	require('http').Server(app).listen(port.http, () => {
		console.log('HTTP listening on ' + port.http);
	});
	
	try {
		
		require('https').Server({
			cert: fs.readFileSync('ssl/ssl.crt'),
			key: fs.readFileSync('ssl/ssl.key'),
			ca: fs.readFileSync('ssl/ca.crt'),
			rejectUnauthorized: false
		}, app).listen(port.https, () => {
			console.log('HTTPS listening on ' + port.https);
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
			console.log('Updated static data: ' + time);
		});
		
	}, 60000);
	
}
