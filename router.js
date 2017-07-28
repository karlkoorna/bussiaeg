module.exports = (app, s, l, p) => {
	
	app.get('/getstops', (req, res) => {
		res.json(s.getStops(req.query.lat_min, req.query.lat_max, req.query.lng_min, req.query.lng_max));
	});
	
	app.get('/getstop', (req, res) => {
		
		const stop = s.getStop(req.query.id);
		
		if (!stop) return void res.status(418).end();
		
		res.json(stop);
		
	});
	
	app.get('/gettrips', (req, res) => {
		
		if (!req.query.id) return void res.status(418).end();
		
		const ids = req.query.id.split(',');
		const tripz = [];
		
		next();
		function next(trips) {
			
			if (trips) tripz.push(trips);
			
			if (tripz.length !== ids.length) {
				
				const id = ids[tripz.length];
				
				return void l.getSiri(id, (siri) => {
					
					if (siri) return void next(s.getTrips(id, true).concat(siri).sort((a, b) => a.sort - b.sort).splice(0, 15));
					
					l.getElron(id, (elron) => {
						next(elron || s.getTrips(id, false));
					});
					
				});
				
			}
			
			res.json(tripz.length > 1 ? tripz : tripz[0]);
			
		}
		
	});
	
	app.get('/getpanel', (req, res) => {
		
		const panel = p.getPanel(req.query.id);
		
		if (!panel) return void res.status(401).end();
		if (!panel.enabled) return void res.status(402).end();
		
		res.json(panel);
		
	});
	
	app.get('/version', (req, res) => {
		res.send(JSON.parse(require('fs').readFileSync('package.json').toString()).version);
	});
	
};
