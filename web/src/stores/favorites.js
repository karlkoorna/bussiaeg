import { observable, action, reaction } from 'mobx';

export default new class StoreFavorites {
	
	@observable
	favorites = []
	
	@action
	toggle(id, data) {
		const index = this.favorites.findIndex((favorite) => favorite.id === id);
		if (index > -1) this.favorites.splice(index, 1); else this.favorites.push(data);
		return index < 0;
	}
	
	exists(id) {
		return this.favorites.findIndex((favorite) => favorite.id === id);
	}
	
	constructor() {
		
		// Restore favorites from local storage.
		this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
		
		// Save favorites to local storage on change.
		reaction(() => ({
			favorites: this.favorites,
			length: this.favorites.length
		}), ({ favorites }) => {
			localStorage.setItem('favorites', JSON.stringify(favorites));
		});
		
	}
	
};
