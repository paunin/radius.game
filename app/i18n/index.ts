import { en } from './translations/en';
import { ja } from './translations/ja';
import { ru } from './translations/ru';
import { zh } from './translations/zh';
import { ko } from './translations/ko';
import { vi } from './translations/vi';

export const translations = {
  en,
  ja,
  ru,
  zh,
  ko,
  vi
} as const;

export const languageNames = {
  en: 'English',
  ja: '日本語',
  ru: 'Русский',
  zh: '中文',
  ko: '한국어',
  vi: 'Tiếng Việt'
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;

export const getTranslation = (lang: Language) => translations[lang]; 