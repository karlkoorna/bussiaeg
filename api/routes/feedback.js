const nodemailer = require('nodemailer');

const db = require('../db.js');
const email = require('../utils/email.js');

// Post feedback with message and contact info.
async function postFeedback(req, res) {
	
	await email.send('Tagasiside', `
		<b>${email.sanitize(req.body['contact'])}</b>
		<p>${email.sanitize(req.body['message'])}</p>
	`);
	
	res.send();
	
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
