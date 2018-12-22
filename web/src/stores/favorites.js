import { decorate, observable, action, reaction } from 'mobx';

class StoreFavorites {
	
	favorites = []
	
	// Toggle stop in favorites and return result state.
	toggle(stop) {
		const index = this.favorites.findIndex((favorite) => favorite.id === stop.id);
		if (index === -1) this.favorites.push(stop); else this.favorites.splice(index, 1);
		return index === -1;
	}
	
	// Return stop if in favorites.
	get(id) {
		return Boolean(this.favorites.find((favorite) => favorite.id === id)) || null;
	}
	
	constructor() {
		
		// Restore favorites from local storage.
		this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
		
		// Save favorites to local storage on change.
		reaction(() => ({
			favorites: this.favorites,
			length: this.favorites.length
		}), ({ favorites }) => {
			console.log(123);
			localStorage.setItem('favorites', JSON.stringify(favorites));
		});
		
	}
	
};

decorate(StoreFavorites, {
	favorites: observable,
	toggle: action
});

export default new StoreFavorites();
