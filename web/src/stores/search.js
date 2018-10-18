import { observable, action, reaction } from 'mobx';

import storeCoords from 'stores/coords.js';

export default new class StoreSearch {
	
	dispose = 0
	
	@observable
	query = ''
	
	@observable
	type = 'stops'
	
	@observable.struct
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
	
	@action
	updateQuery(query) {
		this.query = query;
	}
	
	@action
	updateType(type) {
		this.type = type;
	}
	
	@action.bound
	async fetchResults() {
		const [ query, lat, lng ] = [ this.query, storeCoords.lat, storeCoords.lng ];
		
		// Return on manual search or if coordinates unavailable.
		if (query || !lat || !lng) return;
		
		// Fetch search results.
		const results = await (await fetch(`${process.env['REACT_APP_API']}/search?${query ? `&query=${query}` : ''}${lat && lng ? `&lat=${lat}&lng=${lng}` : ''}`)).json();
		if (results) this.results = results;
		
	}
	
};
