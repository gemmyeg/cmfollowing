import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './ar';
import en from './en';

export type Language = 'ar' | 'en';

const STORAGE_KEY = 'language';

function deviceLanguage(): Language {
  return getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
}

/** Loads the saved language (or the device language) and starts i18next. */
export async function initI18n(): Promise<void> {
  const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as Language | null;
  const lng = saved ?? deviceLanguage();

  await i18n.use(initReactI18next).init({
    resources: { ar: { translation: ar }, en: { translation: en } },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  applyDirection(lng);
}

/** React Native only applies a direction change after the app restarts. */
function applyDirection(lng: Language): boolean {
  const rtl = lng === 'ar';
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL === rtl) return false;
  I18nManager.forceRTL(rtl);
  return true;
}

/** Switches language. Returns true when a restart is needed for RTL/LTR. */
export async function setLanguage(lng: Language): Promise<boolean> {
  await AsyncStorage.setItem(STORAGE_KEY, lng);
  await i18n.changeLanguage(lng);
  return applyDirection(lng);
}

export default i18n;
