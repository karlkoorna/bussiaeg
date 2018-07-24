// Add or remove stop from favorites.
function toggle(id) {
	
	// Load or create favorites array.
	const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	
	// Remove or add favorite.
	if (has(id)) favorites.splice(favorites.indexOf(id), 1); else favorites.push(id);
	
	// Save changes to local storage.
	localStorage.setItem('favorites', JSON.stringify(favorites));
	
	// Return state.
	return has(id);
	
}

// Check if stop is in favorites.
function has(id) {
	return (JSON.parse(localStorage.getItem('favorites')) || []).findIndex((favorite) => favorite === id) > -1;
}

export default {
	toggle,
	has
};
