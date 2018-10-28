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

// Convert HMS to time format.
export function formatTime(hms) {
	return hms[0].toString().padStart(2, '0') + ':' + hms[1].toString().padStart(2, '0');
};

// Convert HMS to countdown format.
export function formatCountdown(hms) {
	return (hms[0] ? `${hms[0]}h ` : '') + (hms[1] ? `${hms[1]}m` : '0m');
};
