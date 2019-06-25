import { decorate, observable, action, reaction } from 'mobx';
import i18n from 'i18next';

const $app = document.getElementById('app');

class StoreSettings {
	
	data = {}
	
	defaultData = {
		lang: i18n.languages[0] || 'en',
		theme: 'light',
		view: 'map'
	}
	
	// Update setting, optionally save to localStorage.
	update(key, value, shouldSave = false) {
		if (shouldSave) {
			this.data[key] = value;
			localStorage.setItem('settings', JSON.stringify(this.data));
		}
		
		// Handle setting side effects.
		switch (key) {
			case 'lang':
				
				i18n.changeLanguage(value);
				document.body.parentElement.setAttribute('lang', value);
				break;
			case 'theme':
				$app.setAttribute('data-theme', value);
				break;
			default: break;
		}
	}
	
	// Load and apply settings.
	constructor() {
		this.data = { ...this.defaultData, ...JSON.parse(localStorage.getItem('settings') || '{}') };
		for (const key of Object.keys(this.data)) this.update(key, this.data[key]);
	}
	
}

decorate(StoreSettings, {
	data: observable,
	update: action
});

export default new StoreSettings();
