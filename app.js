const port = { http: 80, https: 443 };

const express = require('express'), app = express();
const fs = require('fs');

app.use(express.static(__dirname + '/public'));

require('./providers/static.js')((s) => {
	
	require('http').Server(app).listen(port.http, (err) => {
		console.log('HTTP listening on ' + port.http);
	});
	
	try {
		
		require('https').Server({
			cert: fs.readFileSync('ssl/ssl.crt'),
			key: fs.readFileSync('ssl/ssl.key'),
			ca: fs.readFileSync('ssl/ca.crt'),
			rejectUnauthorized: false
		}, app).listen(port.https, (err) => {
			console.log('HTTPS listening on ' + port.https);
		});
		
	} catch(ex) {
		console.log('HTTPS failed to start listening!');
	}
	
	require('./router.js')(app, s, require('./providers/live.js'));
	
	scheduleUpdate(s);
	
});

function getSeconds() {
	return ~~((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
}

// Update between 4 & 5 pm, check every hour
function scheduleUpdate(s) {
	
	setInterval(() => {
		if (getSeconds() > 14400 && getSeconds() < 18000) s.update(() => {
			console.log('Updated static data: ' + new Date());
		});
	}, 1000 * 60 * 60 * 1);
	
}