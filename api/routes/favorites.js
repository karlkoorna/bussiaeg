const db = require('../db.js');

// Get favorites by id.
function getFavorites(req, res) {
	
	db.query('SELECT data FROM favorites WHERE id = ?', [ req.query.id ], (err, rows) => {
		
		if (err) return void res.code(500).send(err);
		if (rows.length === 0) return void res.send([]);
		
		res.send(rows[0].data);
		
	});
	
}

// Post favorites and return id.
async function postFavorites(req, res) {
	
	next();
	function next() {
		
		const id = Math.random().toString(36).substr(2, 4).toUpperCase();
	
		db.query('INSERT INTO favorites (id, data) VALUES (?, ?)', [ id, JSON.stringify(req.body) ], (err, rows) => {
			
			if (err) if (err.message.includes('Duplicate')) return void next();
			if (err) return void res.code(500).send(err);
			
			res.send(id);
			
		});
		
	}
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/favorites', getFavorites);
	
	fastify.post('/favorites', {
		schema: {
			body: {
				type: 'array',
				minItems: 1,
				items: {
					type: 'object',
					required: [ 'id', 'name', 'direction' ],
					properties: {
						id: { type: 'string', minLength: 3 },
						name: { type: 'string', minLength: 1 },
						direction: { type: 'string', minLength: 1 }
					}
				}
			}
		}
	}, postFavorites);
	
	next();
	
};
