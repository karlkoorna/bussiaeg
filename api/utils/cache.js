const cache = {};

// Add/get to/from cache.
async function use(space, key, setter) {
	
	// Create cache if not exists.
	if (!cache[space]) cache[space] = {};
	
	// Add item if doesn't exist.
	if (!cache[space][key]) cache[space][key] = await setter();
	
	// Return new dereferenced item.
	return Array.isArray(cache[space][key]) ? [ ...cache[space][key] ] : { ...cache[space][key] };
	
};

// Clear cache.
function clear() {
	cache = {};
}

// Add route to browser cache until 6 AM next day.
function middleware(req, res, next) {
	const date = new Date();
	date.setDate(date.getDate() + 1);
	date.setHours(6, 0, 0, 0);
	res.header('Expires', date.toGMTString());
	next();
}

module.exports = {
	use,
	clear,
	middleware
};
