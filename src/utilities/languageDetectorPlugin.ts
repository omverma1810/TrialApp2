import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocales} from 'react-native-localize';

const LANGUAGE_KEY = 'cache_language';

const languageDetectorPlugin: any = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback: (lang: string) => void) => {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (language) {
        return callback(language);
      } else {
        return callback(getLocales()[0].languageCode);
      }
    } catch (error) {
      console.log('Error while detecting language', error);
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error while caching language', error);
    }
  },
};

export {languageDetectorPlugin};
