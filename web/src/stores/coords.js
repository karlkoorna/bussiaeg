import { decorate, observable, action } from 'mobx';

class StoreCoords {
	
	lat = 0
	lng = 0
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
