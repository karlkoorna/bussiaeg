import { decorate, observable, action, reaction } from 'mobx';

import storeCoords from 'stores/coords.js';

class StoreSearch {
	
	dispose = 0
	
	query = ''
	results = []
	
	// Start fetching nearby search results on location update.
	startScanning() {
		
		this.dispose = reaction(() => ({
			lat: storeCoords.lat,
			lng: storeCoords.lng
		}), () => {
			if (!this.query) this.fetchResults();
		}, { fireImmediately: true });
		
	}
	
	// Stop fetching nearby search results on location update.
	stopScanning() {
		this.dispose();
	}
	
	// Update search query.
	updateQuery(query) {
		this.query = query;
	}
	
	// Fetch search results.
	async fetchResults() {
		const [ query, lat, lng ] = [ this.query, storeCoords.lat, storeCoords.lng ];
		this.results = query || (lat && lng) ? await (await fetch(`${process.env['REACT_APP_API']}/search?${query ? `&query=${query}` : ''}${lat && lng ? `&lat=${lat}&lng=${lng}` : ''}`)).json() : [];
	}
	
};

decorate(StoreSearch, {
	query: observable,
	type: observable,
	results: observable.struct,
	updateQuery: action,
	fetchResults: action.bound
});

export default new StoreSearch();
