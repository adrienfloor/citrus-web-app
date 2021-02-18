import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import * as translationsEN from './locales/en/translation.json'
import * as translationsFR from './locales/fr/translation.json'

const resources = {
	en: {
		translation: translationsEN.default
	},
	fr: {
		translation: translationsFR.default
	}
}

i18n
	.use(LanguageDetector)
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		load: 'languageOnly',
		lng: navigator.language || navigator.userLanguage,
		fallbackLng: 'en',
		order: ['navigator'],
		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false // react already safes from xss
		}
	});

export default i18n