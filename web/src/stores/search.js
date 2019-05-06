import { decorate, observable, action, reaction } from 'mobx';

import { opts as mapOpts } from 'views/Map/Map.jsx';

import storeCoords from 'stores/coords.js';

class StoreSearch {
	
	dispose = null
	
	query = ''
	type = 'stops'
	results = {
		stops: [],
		routes: []
	}
	
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
	
	// Update search type.
	updateType(type) {
		this.type = type;
	}
	
	// Fetch search results.
	async fetchResults() {
		const [ query, lat, lng ] = [ this.query, storeCoords.lat, storeCoords.lng ];
		
		// Clear results if no query or coords.
		if (!query && lat === mapOpts.startLat) return void (this.results = { stops: [], routes: [] });
		
		try {
			this.results = await (await fetch(`${process.env['REACT_APP_API']}/search?${query ? `&query=${query}` : ''}&lat=${lat}&lng=${lng}`)).json();
		} catch (ex) {}
	}
	
}

decorate(StoreSearch, {
	query: observable,
	type: observable,
	results: observable.struct,
	updateQuery: action,
	updateType: action,
	fetchResults: action.bound
});

export default new StoreSearch();
