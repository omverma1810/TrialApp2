import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import en from './translation/en';
import gu from './translation/gu';
import {languageDetectorPlugin} from '../utilities/languageDetectorPlugin';

const LANGUAGES = {
  en,
  gu,
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    compatibilityJSON: 'v3',
    resources: LANGUAGES,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
