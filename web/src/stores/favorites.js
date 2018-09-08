import { observable, action, reaction } from 'mobx';

export default new class StoreFavorites {
	
	@observable
	favorites = []
	
	@action
	toggle(favorite) {
		if (this.has(favorite.id)) this.favorites.splice(this.favorites.findIndex((localFavorite) => localFavorite.id === favorite.id), 1); else this.favorites.push(favorite);
	}
	
	has(id) {
		return Boolean(this.favorites.find((favorite) => favorite.id === id));
	}
	
	constructor() {
		
		this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
		
		reaction(() => ({
			favorites: this.favorites,
			length: this.favorites.length
		}), ({ favorites }) => {
			localStorage.setItem('favorites', JSON.stringify(favorites));
		});
		
	}
	
};
