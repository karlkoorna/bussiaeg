import { decorate, observable, action } from 'mobx';

import { opts as mapOpts } from 'views/Map/Map.jsx';

class StoreCoords {
	
	lat = mapOpts.startLat
	lng = mapOpts.startLng
	accuracy = 9999
	enabled = false
	
	constructor() {
		if (navigator.geolocation) navigator.geolocation.watchPosition((e) => {
			this.enabled = true;
			this.lat = e.coords.latitude;
			this.lng = e.coords.longitude;
			this.accuracy = e.coords.accuracy;
		}, (err) => {
			if (err.code < 3) this.enabled = false;
		}, {
			enableHighAccuracy: true,
			timeout: 300
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
