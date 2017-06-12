module.exports = (app, s, l, p) => {
	
	app.get('/getstops', (req, res) => {
		res.json(s.getStops(req.query.lat_min, req.query.lat_max, req.query.lng_min, req.query.lng_max));
	});
	
	app.get('/getstop', (req, res) => {
		
		var stop = s.getStop(req.query.id);
		
		if (stop == null) return res.status(404).end();
		
		res.json(stop);
		
	});
	
	app.get('/gettrips', (req, res) => {
		
		var id = req.query.id;
		
		l.getSiri(id, (siri) => {
			
			if (siri !== null) {
				
				var trips = s.getTrips(id, true);
				
				if (trips == null) return res.json(siri);
				
				trips = trips.concat(siri);
				
				trips = trips.sort((a, b) => {
					return a.sort - b.sort;
				});
				
				res.json(trips.splice(0, 15));
				
			} else {
				
				l.getElron(id, (elron) => {
					
					if (elron !== null) {
						
						res.json(elron);
						
					} else {
						
						var trips = s.getTrips(id, false);
						
						if (trips !== null) {
							
							res.json(trips);
							
						} else {
							
							res.status(404).end();
							
						}
						
					}
					
				});
				
			}
			
		});
		
	});
	
	app.get('/getpanel', (req, res) => {
		
		var panel = p.getPanel(req.query.id);
		
		if (panel == null) return res.status(401).end();
		if (!panel.enabled) return res.status(402).end();
		
		res.json(panel);
		
	});
	
	app.get('/version', (req, res) => {
		res.send(JSON.parse(require('fs').readFileSync('package.json').toString()).version);
	});
	
}