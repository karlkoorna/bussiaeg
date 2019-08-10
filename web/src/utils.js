// Converts seconds to sign, raw hour, minute and second values.
function secondsToShms(seconds) {
	const absSeconds = Math.abs(seconds);
	const hours = Math.floor(absSeconds / 3600);
	const minutes = Math.floor((absSeconds % 3600) / 60);
	return [ seconds < 0, hours, minutes, absSeconds - (minutes * 60) - (hours * 3600) ];
}

// Convert HMS to time format.
export function formatTime(seconds) {
	const shms = secondsToShms(seconds);
	return shms[1].toString().padStart(2, '0') + ':' + shms[2].toString().padStart(2, '0');
}

// Convert HMS to countdown format.
export function formatCountdown(seconds, isLive) {
	const shms = secondsToShms(seconds);
	return ((shms[0] ? '-' : '') + (shms[1] ? `${shms[1]}h` : '') + (shms[2] ? ` ${shms[2]}m` : '') + ((!shms[1] && !shms[2] && !isLive) || (shms[3] && isLive) ? ` ${shms[3]}s` : '')).trim();
}

/* Distance */

// Format meters to suitable distance units.
export function formatDistance(meters) {
	return meters ? meters >= 100000 ? `${Math.round(meters / 10000) * 10}km` : meters >= 10000 ? `${(meters / 1000).toFixed()}km` : meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters / 10) * 10}m` : '';
}

/* Data */

// Load data from session storage
const data = JSON.parse(sessionStorage.getItem('cache') || '{}');

// Save data in session storage.
window.addEventListener('beforeunload', () => {
	const now = new Date();
	now.setDate(now.getDate() + 1);
	now.setHours(6, 0, 0, 0);
	
	sessionStorage.setItem('cache', now > new Date(sessionStorage.getItem('update') || 0) ? '{}' : JSON.stringify(data));
	sessionStorage.setItem('update', now);
});

// Set data for view path.
export function prepareViewData(type, obj) {
	data[type + (obj.id || obj.routeId)] = obj;
}

// Get data for view path.
export function restoreViewData(type, id) {
	return data[type + id] || null;
}
