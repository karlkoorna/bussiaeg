import { observable, action, runInAction } from 'mobx';

import storeCoords from 'stores/coords.js';

export default new class StoreSearch {
	
	@observable
	query = ''
	
	@observable
	type = 'stops'
	
	@observable.struct
	results = {
		stops: [],
		routes: []
	}
	
	@action.bound
	async fetchResults() {
		
		const [ query, lat, lng ] = [ this.query, storeCoords.lat, storeCoords.lng ];
		const results = query || (lat && lng) ? await (await fetch(`${process.env['REACT_APP_API']}/search?${query ? `&query=${query}` : ''}${lat && lng ? `&lat=${lat}&lng=${lng}` : ''}`)).json() : {};
			
		runInAction(() => {
			this.results = results;
		});
		
	}
	
};
