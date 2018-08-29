import { observable, action } from 'mobx';

export default new class StoreCoords {
	
	@observable
	lat = 0
	
	@observable
	lng = 0
	
	@observable
	accuracy = 9999
	
	@action
	_update(...values) {
		[ this.lat, this.lng, this.accuracy ] = values;
	}
	
	constructor() {
		
		navigator.geolocation.watchPosition((e) => {
			const { latitude: lat, longitude: lng, accuracy } = e.coords;
			this._update(lat, lng, accuracy);
		}, () => {}, {
			enableHighAccuracy: true,
			timeout: 100
		});
		
	}
	
};
