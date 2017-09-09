const app = require('./app.js');
const l = require('./providers/live.js');
const p = require('./providers/panels.js');

let version;

module.exports = (cb) => {
	
	require('./providers/static.js')((s) => {
		
		app.get('/getstops', (req, res) => {
			res.json(s.getStops(req.query.lat_min, req.query.lat_max, req.query.lng_min, req.query.lng_max));
		});
		
		app.get('/getstop', (req, res) => {
			
			const stop = s.getStop(req.query.id);
			
			if (!stop) return void res.status(418).end();
			
			res.json(stop);
			
		});
		
		app.get('/gettrips', (req, res) => {
			
			const ids = req.query.id.split(',');
			const tripz = [];
			
			next();
			function next(trips) {
				
				if (trips) tripz.push(trips);
				
				if (tripz.length !== ids.length) {
					
					const stop = s.getStop(ids[tripz.length]);
					
					if (!stop) return void next([]);
					
					if (stop.provider === 'tlt') return void l.getTLT(stop.id, (trips) => {
						next(s.getTrips(stop.id, trips.length).concat(trips).sort((a, b) => a.sort - b.sort).splice(0, 15).map((trip) => { delete trip.sort; return trip; }));
					});
					
					if (stop.provider === 'elron') return void l.getElron(stop.id, next);
					
					return void next(s.getTrips(stop.id).map((trip) => { delete trip.sort; return trip; }));
					
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
			
			try {
				version = JSON.parse(require('fs').readFileSync('package.json').toString()).version;
			} catch (ex) {}
			
			res.send(version);
			
		});
		
		cb();
		
	});
	
};
