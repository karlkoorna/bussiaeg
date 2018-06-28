const nodemailer = require('nodemailer');

const db = require('../db.js');
const email = require('./utils/email.js');

// Post feedback with message and contact info.
async function postFeedback(req, res) {
	
	try {
		await email.send('Tagasiside', req.body['contact'], req.body['message']);
		res.send();
	} catch (ex) {
		res.code(500).send(ex);
	}
	
}

module.exports = (fastify, opts, next) => {
	
	fastify.post('/feedback', {
		schema: {
			body: {
				type: 'object',
				required: [ 'message', 'contact' ],
				properties: {
					message: { type: 'string', minLength: 32, maxLength: 512 },
					contact: { type: 'string', minLength: 8, maxLength: 64 }
				}
			}
		}
	}, postFeedback);
	
	next();
	
};
