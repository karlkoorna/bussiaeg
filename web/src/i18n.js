import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

import en from './locales/en.json';
import et from './locales/et.json';
import ru from './locales/ru.json';

function genResouces(langs) {
	const resources = {};
	for (const lang of Object.entries(langs)) resources[lang[0]] = { translation: lang[1] };
	return resources;
}

i18n.use(LanguageDetector)
	.use(reactI18nextModule)
	.init({
		resources: genResouces({
			en, et, ru
		}),
		load: 'languageOnly',
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false
		},
		detection: {
			lookupQuerystring: 'lang',
			lookupCookie: 'lang',
			lookupLocalStorage: 'lang'
		}
	});

export default i18n;
