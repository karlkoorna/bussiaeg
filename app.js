const fs = require('fs');
const express = require('express');
const app = express();

const ports = { http: 80, https: 443 };

app.use(express.static('public'));

module.exports = app;

require('./router.js')(() => {
	
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
	
	setInterval(() => {
		
		const time = new Date();
		
		if (time.getHours() === 6 && time.getMinutes() === 15) process.exit();
		
	}, 60000);
	
});
