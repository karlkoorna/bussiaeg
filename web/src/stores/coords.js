let coords = {};

// Get coordinates.
function get(retries, timeout = 250) {
	
	if ((coords.lat && coords.lng) || !retries) return coords;
	
	return new Promise((resolve) => {
		
		let i = 0;
		const checker = setInterval(() => {
			
			if ((coords.lat && coords.lng) || i >= retries) {
				clearInterval(checker);
				return void resolve(coords);
			}
			
			i++;
			
		}, timeout);
		
	});
	
}

// Set coords.
function set(obj) {
	coords = obj;
}

export default {
	get,
	set
};
