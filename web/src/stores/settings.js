import { decorate, observable, action } from 'mobx';
import i18n from 'i18next';

const $app = document.getElementById('app');

class StoreSettings {
	
	data = {
		lang: i18n.language,
		theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
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
				if (window.map) window.map.updateMessage();
				break;
			case 'theme':
				$app.setAttribute('data-theme', value);
				break;
			default: break;
		}
	}
	
	// Load and apply settings.
	constructor() {
		const settings = localStorage.getItem('settings');
		if (settings) this.data = { ...this.data, ...JSON.parse(settings) }; else localStorage.setItem('settings', JSON.stringify(this.data));
		for (const [ key, value ] of Object.entries(this.data)) this.update(key, value);
	}
	
}

decorate(StoreSettings, {
	data: observable,
	update: action
});

export default new StoreSettings();
