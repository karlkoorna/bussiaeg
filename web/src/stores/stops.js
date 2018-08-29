export default new class StoreStops {
	
	stops = []
	
	get(id) {
		return this.stops.find((stop) => stop.id === id);
	}
	
};
