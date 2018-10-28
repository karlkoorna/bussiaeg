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

