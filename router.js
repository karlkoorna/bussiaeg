module.exports = (app, s, l) => {
	
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
		
		l.getSiri(id, (data) => {
			
			if (data === 'timeout') {
				
				res.status(504).end();
				
			} else if (data !== null) {
				
				var trips = s.getTrips(id, true);
				
				trips = trips.concat(data);
				
				trips = trips.sort((a, b) => {
					return a.sort - b.sort;
				});
				
				res.json(trips.splice(0, 15));
				
			} else {
				
				l.getElron(id, (data) => {
					
					if (data === 'timeout') {
						
						res.status(504).end();
						
					} else if (data !== null) { 
						
						res.json(data);
						
					} else {
						
						res.json(s.getTrips(id, false));
						
					}
					
				});
				
			}
			
		});
		
	});
	
	app.get('/version', (req, res) => {
		res.send(JSON.parse(require('fs').readFileSync('package.json').toString()).version);
	});
	
}