import i18n from 'i18next';

const $app = document.getElementById('app');

class StoreSettings {
	
	data = {}
	
	defaultData = {
		lang: i18n.language || 'en',
		theme: 'light',
		view: 'map'
	}
	
	// Update setting.
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
			
			default:
				break;
			
		}
		
	}
	
	// Load and apply settings.
	constructor() {
		this.data = { ...this.defaultData, ...JSON.parse(localStorage.getItem('settings') || '{}') };
		for (const key of Object.keys(this.data)) this.update(key, this.data[key]);
	}
	
}

export default new StoreSettings();
