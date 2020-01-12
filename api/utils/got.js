const got = require('got');

module.exports = got.extend({
	retry: {
		calculateDelay({ attemptCount }) {
			return attemptCount <= 1 ? 1000 : 0
		}
	}
});
