import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import et from './locales/et.json';
import ru from './locales/ru.json';

function genResources(langs) {
	const resources = {};
	for (const lang of Object.entries(langs)) resources[lang[0]] = { translation: lang[1] };
	return resources;
}

i18n.use(initReactI18next).init({
	resources: genResources({ en, et, ru }),
	load: 'languageOnly',
	lng: navigator.languages.filter((language) => [ 'et', 'en', 'ru' ].some((lang) => language.indexOf(lang) > -1))[0].split('-')[0],
	fallbackLng: 'et',
	interpolation: {
		escapeValue: false
	}
});
