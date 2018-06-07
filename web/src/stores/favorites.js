// Add or remove stop from favorites.
function toggle(id) {
	
	// Load or create favorites array.
	const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
	
	// Add or remove favorite.
	if (is(id)) favorites.splice(favorites.indexOf(id), 1);
	else favorites.push(id);
	
	// Save changes to local storage.
	localStorage.setItem('favorites', JSON.stringify(favorites));
	
	// Return state.
	return is(id);
	
}

// Check if stop is in favorites.
function is(id) {
	return (JSON.parse(localStorage.getItem('favorites')) || []).findIndex((favorite) => favorite === id) > -1;
}

export default {
	toggle,
	is
};
