import { observable, action } from 'mobx';

export default new class StoreCoords {
	
	@observable
	lat = 0
	
	@observable
	lng = 0
	
	@observable
	accuracy = 9999
	
	@action
	_update(coords) {
		[ this.lat, this.lng, this.accuracy ] = [ coords.lat, coords.lng, coords.accuracy ];
	}
	
	constructor() {
		
		if (navigator.geolocation) navigator.geolocation.watchPosition((e) => {
			this._update(e.coords);
		}, () => {}, {
			enableHighAccuracy: true,
			timeout: 100
		});
		
	}
	
};
