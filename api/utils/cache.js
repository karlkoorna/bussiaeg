let cache = {};

// Add/get to/from cache.
async function use(space, key, setter) {
	// Create cache if not exists.
	if (!cache[space]) cache[space] = {};
	
	// Add item if doesn't exist.
	if (!cache[space][key]) cache[space][key] = await setter();
	
	// Return new dereferenced item.
	return [ ...cache[space][key] ];
}

// Clear cache.
function clear() {
	cache = {};
}

module.exports = {
	use,
	clear
};
