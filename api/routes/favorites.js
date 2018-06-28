const db = require('../db.js');

// Get favorites by id.
async function getFavorites(req, res) {
	
	try {
		const rows = await db.query('SELECT data FROM favorites WHERE id = ?', [ req.query.id ]);
		res.send(rows.length ? rows[0].data : []);
	} catch (ex) {
		res.code(500).send(ex);
	}
	
}

// Post favorites and return id.
async function postFavorites(req, res) {
	
	try {
		
		// Generate a random 4 character upper-case code.
		const id = Math.random().toString(36).substr(2, 4).toUpperCase();
		
		await db.query('INSERT INTO favorites (id, data) VALUES (?, ?)', [ id, JSON.stringify(req.body) ]);
		res.send(id);
		
	} catch (ex) {
		res.code(500).send(err);
	}
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.get('/favorites', getFavorites);
	
	fastify.post('/favorites', {
		schema: {
			body: {
				type: 'array',
				minItems: 1,
				maxItems: 32,
				items: {
					type: 'object',
					required: [ 'id', 'name', 'direction' ],
					properties: {
						id: { type: 'string', minLength: 3, maxLength: 32 },
						name: { type: 'string', minLength: 1, maxLength: 32 },
						direction: { type: 'string', minLength: 1, maxLength: 32 }
					}
				}
			}
		}
	}, postFavorites);
	
	next();
	
};
