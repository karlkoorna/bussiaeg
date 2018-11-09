import React from 'react';

const $app = document.getElementById('app');

// Call function in component on theme change.
export function withTheme(C) {
	return class extends C {
		
		componentDidMount() {
			
			(new MutationObserver(() => {
				if (this.themeChange) this.themeChange(); else this.wrappedInstance.themeChange();
			})).observe($app, { attributes: true });
			
		}
		
	};
};

// Converts seconds to raw hour, minute and second values.
function secondsToShms(seconds) {
	const absSeconds = Math.abs(seconds);
	const hours = Math.floor(absSeconds / 3600);
	const minutes = Math.floor((absSeconds % 3600) / 60);
	return [ seconds < 0, hours, minutes, absSeconds - (minutes * 60) - (hours * 3600) ];
}

// Convert HMS to time format.
export function formatTime(seconds) {
	const shms = secondsToShms(seconds);
	return (shms[0] ? '-' : '') + shms[1].toString().padStart(2, '0') + ':' + shms[2].toString().padStart(2, '0');
};

// Convert HMS to countdown format.
export function formatCountdown(seconds) {
	const shms = secondsToShms(seconds);
	return (shms[0] ? '-' : '') + (shms[1] ? `${shms[1]}h ` : '') + (shms[2] ? `${shms[2]}m` : '0m');
};
