import { decorate, observable, action } from 'mobx';

import { opts as mapOpts } from 'views/Map/Map.jsx';

class StoreCoords {
	
	lat = mapOpts.startLat
	lng = mapOpts.startLng
	accuracy = 9999
	
	constructor() {
		if (navigator.geolocation) navigator.geolocation.watchPosition((e) => {
			this.update(e.coords);
		}, () => {}, {
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
