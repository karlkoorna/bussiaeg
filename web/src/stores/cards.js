import { decorate, observable, action, reaction } from 'mobx';

class StoreCards {
	
	cards = []
	
	// Toggle stop in cards and return result state.
	toggle(stop) {
		const index = this.cards.findIndex((favorite) => favorite.id === stop.id);
		if (index === -1) this.cards.push(stop); else this.cards.splice(index, 1);
		return index === -1;
	}
	
	// Return stop if in cards.
	get(id) {
		return this.cards.find((favorite) => favorite.id === id) || null;
	}
	
	constructor() {
		// Restore cards from local storage.
		this.cards = JSON.parse(localStorage.getItem('cards') || '[]');
		
		// Save cards to local storage on change.
		reaction(() => ({
			cards: this.cards,
			length: this.cards.length
		}), ({ cards }) => {
			localStorage.setItem('cards', JSON.stringify(cards));
		});
		
		// Convert legacy bookmarks.
		(async () => {
			const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
			
			if (bookmarks.length) try {
				const cards = [];
				for (const bookmark of bookmarks) cards.push((await (await fetch(`${process.env['REACT_APP_API']}/stops?id=${bookmark.stop}`)).json())[0]);
					
				localStorage.setItem('cards', JSON.stringify(cards));
				localStorage.removeItem('bookmarks');
			} catch {}
		})();
	}
	
}

decorate(StoreCards, {
	cards: observable,
	toggle: action
});

export default new StoreCards();
