// Get favorites.
function get() {
	return JSON.parse(localStorage.getItem('favorites')) || [];
}

// Set favorites.
function set(ids) {
	localStorage.setItem('favorites', JSON.stringify(ids));
}

// Check if stop is in favorites.
function has(id) {
	return get().indexOf(id) > -1;
}

// Add or remove stop from favorites.
function toggle(id) {
	
	// Load or create favorites array.
	const favorites = get();
	
	// Remove or add favorite.
	if (has(id)) favorites.splice(favorites.indexOf(id), 1); else favorites.push(id);
	
	// Save changes to local storage.
	localStorage.setItem('favorites', JSON.stringify(favorites));
	
	// Return state.
	return has(id);
	
}

export default {
	toggle,
	get,
	set,
	has
};
