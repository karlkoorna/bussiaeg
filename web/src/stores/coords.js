import { decorate, observable, action } from 'mobx';

import { opts as mapOpts } from 'views/Map/Map.jsx';

class StoreCoords {
	
	lat = mapOpts.startLat
	lng = mapOpts.startLng
	accuracy = 9999
	enabled = true
	
	constructor() {
		if (navigator.geolocation) navigator.geolocation.watchPosition((e) => {
			this.enabled = true;
			this.update(e.coords);
		}, (err) => {
			if (err.code < 3) this.enabled = false;
		}, {
			enableHighAccuracy: true,
			timeout: 300
		});
	}
	
	// Update coordinates and accuracy in store.
	update(coords) {
		[ this.lat, this.lng, this.accuracy ] = [ coords.latitude || coords.lat, coords.longitude || coords.lng, coords.accuracy ];
	}
	
}

decorate(StoreCoords, {
	lat: observable,
	lng: observable,
	accuracy: observable,
	update: action
});

export default new StoreCoords();
