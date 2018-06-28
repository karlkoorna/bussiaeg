const nodemailer = require('nodemailer');

// Connect to SMTP server.
const transporter = nodemailer.createTransport({
	host: 'smtp-mail.outlook.com',
	port: 587,
	auth: {
		user: process.env['EMAIL_USER'],
		pass: process.env['EMAIL_PASS']
	}
});

// Send mail with subject and html body, take credentials from environment.
function send(subject, html) {
	return new Promise((resolve, reject) => {
		
		transporter.sendMail({
			from: process.env['EMAIL_USER'],
			to: process.env['EMAIL_TO'],
			subject,
			html
		}, (err, info) => {
			if (err) return void reject(err);
			resolve();
		});
		
	});
}

module.exports = {
	send
};
