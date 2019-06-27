let cache = {};

// Get data from cache, add to cache if not found.
async function use(space, key, setter) {
	// Ensure space exists.
	if (!cache[space]) cache[space] = {};
	
	// Set value if applicable.
	if (!cache[space][key] && setter) cache[space][key] = await setter();
	
	// Return new dereferenced value.
	const value = cache[space][key];
	return typeof value === 'object' ? Array.isArray(value) ? [ ...value ] : { ...value } : value;
}

// Clear cache.
function clear() {
	cache = {};
}

// Keep until browser cache until specified hour of next day.
function middleware(hour) {
	return function(req, res, next) {
		const date = new Date();
		date.setDate(date.getDate() + 1);
		date.setHours(hour, 0, 0, 0);
		
		res.header('Cache-Control', `max-age=${Math.ceil((date - new Date()) / 1000)}, private`);
		next();
	};
}

module.exports = {
	use,
	clear,
	middleware
};
