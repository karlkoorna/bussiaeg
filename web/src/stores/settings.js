import i18n from 'i18next';

const $app = document.getElementById('app');

export default new class StoreSettings {
	
	// Default settings.
	data = {
		lang: i18n.language || 'en',
		theme: 'light',
		startZoom: 16,
		stopZoom: 15
	}
	
	// Apply setting and optionally update localStorage.
	update(key, value, save) {
		
		if (save) {
			this.data[key] = value;
			localStorage.setItem('settings', JSON.stringify(this.data));
		}
		
		// Handle special settings.
		switch (key) {
			
			case 'lang':
				i18n.changeLanguage(value);
				break;
			
			case 'theme':
				$app.setAttribute('data-theme', value);
				break;
			
		}
		
	}
	
	// Load and apply settings.
	constructor() {
		this.data = { ...this.data, ...JSON.parse(localStorage.getItem('settings') || '{}') };
		for (const key of Object.keys(this.data)) this.update(key, this.data[key]);
	}
	
}
