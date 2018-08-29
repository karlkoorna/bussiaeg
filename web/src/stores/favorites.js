import { observable, action, reaction } from 'mobx';

export default new class StoreFavorites {
	
	@observable
	ids = []
	
	@action
	toggle(id) {
		if (this.has(id)) this.ids.splice(this.ids.indexOf(id), 1); else this.ids.push(id);
	}
	
	has(id) {
		return this.ids.indexOf(id) > -1;
	}
	
	constructor() {
		
		this.ids = JSON.parse(localStorage.getItem('favorites')) || [];
		
		reaction(() => ({
			ids: this.ids,
			length: this.ids.length
		}), ({ ids }) => {
			localStorage.setItem('favorites', JSON.stringify(ids));
		});
		
	}
	
};
