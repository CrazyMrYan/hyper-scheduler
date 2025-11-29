import { en } from './en';
import { zh } from './zh';

type Lang = 'en' | 'zh';
type Translation = typeof en;

let currentLang: Lang = 'en';
let translations: Translation = en;

export function setLanguage(lang: Lang) {
  currentLang = lang;
  translations = lang === 'zh' ? zh : en;
}

export function getLanguage(): Lang {
  return currentLang;
}

export function t(key: string, params?: Record<string, any>): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      return key; // Fallback to key if not found
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => {
      return params[k] !== undefined ? String(params[k]) : `{${k}}`;
    });
  }

  return value;
}
