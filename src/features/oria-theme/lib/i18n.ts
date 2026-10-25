import en from "../public/locales/en/common.json";
import zh from "../public/locales/zh/common.json";
import {localize} from '@/i18n/localize';
import type {Locale} from '@/i18n/config';
export {locales, isLocale, type Locale} from '@/i18n/config';
export function getCopy(locale: Locale): typeof en { return localize(locale, en, zh); }
