let stops = [];

// Get stops/stop by id.
function get(id) {
	return id ? stops.find((stop) => stop.id === id) : stops;
}

// Set stops.
function set(arr) {
	stops = arr;
}

export default {
	get,
	set
};
