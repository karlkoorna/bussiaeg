module.exports = (app, s, l, p) => {
	
	app.get('/getstops', (req, res) => {
		res.json(s.getStops(req.query.lat_min, req.query.lat_max, req.query.lng_min, req.query.lng_max));
	});
	
	app.get('/getstop', (req, res) => {
		
		const stop = s.getStop(req.query.id);
		
		if (stop) {
			
			res.json(stop);
			
		} else {
			
			res.status(500).end();
			
		}
		
	});
	
	app.get('/gettrips', (req, res) => {
		
		const id = req.query.id;
		
		l.getSiri(id, (siri) => {
			
			if (siri) {
				
				const trips = s.getTrips(id, true);
				
				if (trips) {
					
					res.json(trips.concat(siri).sort((a, b) => {
						return a.sort - b.sort;
					}).splice(0, 15));
					
				} else {
					
					res.json(siri);
					
				}
				
			} else {
				
				l.getElron(id, (elron) => {
					
					if (elron) {
						
						res.json(elron);
						
					} else {
						
						const trips = s.getTrips(id, false);
						
						if (trips) {
							
							res.json(trips);
							
						} else {
							
							res.status(502).end();
							
						}
						
					}
					
				});
				
			}
			
		});
		
	});
	
	app.get('/getpanel', (req, res) => {
		
		const panel = p.getPanel(req.query.id);
		
		if (panel) {
			
			res.json(panel);
			
		} else if (!panel) {
			
			res.status(401).end();
			
		} else if (!panel.enabled) {
			
			res.status(402).end();
			
		}
		
	});
	
	app.get('/version', (req, res) => {
		res.send(require('./package.json').version);
	});
	
};
