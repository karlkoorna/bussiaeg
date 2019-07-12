let data = null;

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
	return ((shms[0] ? '-' : '') + (shms[1] ? `${shms[1]}h` : '') + (shms[2] ? ` ${shms[2]}m` : '') + ((!shms[2] && !isLive) || (shms[3] && isLive) ? ` ${shms[3]}s` : '')).trim();
}

// Format meters to suitable distance units.
export function formatDistance(meters) {
	return meters ? meters >= 100000 ? `${Math.round(meters / 10000) * 10}km` : meters >= 10000 ? `${(meters / 1000).toFixed()}km` : meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters / 10) * 10}m` : '';
}

// Save colors for use in next view.
export function prepareViewData(obj) {
	data = obj;
}

// Get colors from last view.
export function restoreViewData(key) {
	return data[key] || data;
}
