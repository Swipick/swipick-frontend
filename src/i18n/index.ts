import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { installaPluralRules } from './pluralRules';
import { it } from './it';
import { en } from './en';

/** Le lingue dell'app. */
export type Lingua = 'it' | 'en';
/** Cosa ha scelto l'utente: una lingua, oppure seguire il telefono. */
export type SceltaLingua = 'auto' | Lingua;

/**
 * La lingua del telefono, ridotta alle due dell'app: italiano se la prima
 * lingua del telefono è l'italiano, inglese in tutti gli altri casi (un
 * tedesco legge più facilmente l'inglese che l'italiano).
 */
export function linguaDelTelefono(): Lingua {
  try {
    return getLocales()[0]?.languageCode === 'it' ? 'it' : 'en';
  } catch {
    return 'it';
  }
}

export function risolviLingua(scelta: SceltaLingua): Lingua {
  return scelta === 'auto' ? linguaDelTelefono() : scelta;
}

installaPluralRules();

i18n.use(initReactI18next).init({
  resources: { it: { translation: it }, en: { translation: en } },
  // Si parte dalla lingua del telefono; la scelta salvata, se c'è, arriva
  // subito dopo da useLinguaStore.carica().
  lng: linguaDelTelefono(),
  fallbackLng: 'it',
  interpolation: { escapeValue: false }, // React fa già l'escape
  returnNull: false,
});

export default i18n;
