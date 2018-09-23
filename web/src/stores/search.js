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
	
	startScanning() {
		
		this.dispose = reaction(() => ({
			lat: storeCoords.lat,
			lng: storeCoords.lng
		}), () => {
			if (!this.query) this.fetchResults();
		});
		
	}
	
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
		const results = query || (lat && lng) ? await (await fetch(`${process.env['REACT_APP_API']}/search?${query ? `&query=${query}` : ''}${lat && lng ? `&lat=${lat}&lng=${lng}` : ''}`)).json() : {};
		this.results = results;
	}
	
};
