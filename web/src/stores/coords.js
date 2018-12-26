import { decorate, observable, action } from 'mobx';

import { opts as mapOpts } from 'views/Map/Map.jsx';

class StoreCoords {
	
	lat = mapOpts.startLat
	lng = mapOpts.startLng
	accuracy = 9999
	
	// Update coordinates and accuracy in store.
	update(coords) {
		[ this.lat, this.lng, this.accuracy ] = [ coords.latitude || coords.lat, coords.longitude || coords.lng, coords.accuracy ];
	}
	
	constructor() {
		
		if (navigator.geolocation) navigator.geolocation.watchPosition((e) => {
			this.update(e.coords);
		}, () => {}, {
			enableHighAccuracy: true,
			timeout: 100
		});
		
	}
	
}

decorate(StoreCoords, {
	lat: observable,
	lng: observable,
	accuracy: observable,
	update: action
});

export default new StoreCoords();
