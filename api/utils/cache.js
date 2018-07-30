const cache = {};

// Add/get to/from cache.
async function use(name, item, setter) {
	
	// Create cache if not exists.
	if (!cache[name]) cache[name] = [];
	
	// Add item if doesn't exist.
	if (!cache[name][item]) cache[name][item] = await setter();
	
	// Return item.
	return [ ...cache[name][item] ];
	
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
