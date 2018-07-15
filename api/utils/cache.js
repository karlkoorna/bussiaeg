const cache = {};

// Add/get to/from cache.
async function use(name, item, setter) {
	
	// If modifying the whole cache.
	if (!setter) {
		
		// Add data if doesn't exist.
		if (!cache[name]) cache[name] = await item();
		
		// Return data.
		return cache[name];
		
	}
	
	// Create cache if not exists.
	if (!cache[name]) cache[name] = [];
	
	// Add item if doesn't exist.
	if (!cache[name][item]) cache[name][item] = await setter();
	
	// Return item.
	return cache[name][item];
	
};

// Clear cache.
function clear() {
	cache = {};
}

// Add route to browser cache for one day.
function middleware(req, res, next) {
	const now = new Date();
	now.setDate(now.getDate() + 1);
	now.setHours(6, 0, 0, 0);
	res.header('Cache-Control', `max-age=${Math.floor((now.getTime() - new Date()) / 1000)}`);
	next();
}

module.exports = {
	use,
	clear,
	middleware
};
