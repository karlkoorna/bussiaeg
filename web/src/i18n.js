import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

i18n.use(XHR)
	.use(LanguageDetector)
	.use(reactI18nextModule)
	.init({
		load: 'languageOnly',
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false
		},
		backend: {
			loadPath: '/locales/{{lng}}.json'
		},
		detection: {
			lookupQuerystring: 'lang',
			lookupCookie: 'lang',
			lookupLocalStorage: 'lang'
		}
	});

export default i18n;
