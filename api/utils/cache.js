let cache = {};

// Get data from cache, add if not found.
async function use(space, key, setter) {
	// Create cache if not exists.
	if (!cache[space]) cache[space] = {};
	
	// Add item if doesn't exist.
	if (!cache[space][key]) cache[space][key] = await setter();
	
	// Return new dereferenced item.
	const value = cache[space][key];
	return Array.isArray(value) ? [ ...value ] : { ...value };
}

// Clear cache.
function clear() {
	cache = {};
}

// Add route to browser cache until specified hour.
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
