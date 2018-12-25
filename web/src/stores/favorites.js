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
		this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
		
		// Save favorites to local storage on change.
		reaction(() => ({
			favorites: this.favorites,
			length: this.favorites.length
		}), ({ favorites }) => {
			localStorage.setItem('favorites', JSON.stringify(favorites));
		});
		
		// Convert legacy bookmarks.
		
		(async () => {
			
			const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
			
			if (bookmarks.length) {
				
				try {
					
					const favorites = [];
					for (const bookmark of bookmarks) favorites.push((await (await fetch(`${process.env['REACT_APP_API']}/stops?id=${bookmark.stop}`)).json())[0]);
					
					localStorage.setItem('favorites', JSON.stringify(favorites));
					localStorage.removeItem('bookmarks');
					
				} catch (ex) {}
				
			}
			
		})();
		
	}
	
};

decorate(StoreFavorites, {
	favorites: observable,
	toggle: action
});

export default new StoreFavorites();
