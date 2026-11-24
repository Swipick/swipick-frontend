import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import i18n, { risolviLingua, type Lingua, type SceltaLingua } from '../../i18n';

/**
 * La lingua dell'app: quella scelta nelle Impostazioni, o "automatica" (il
 * telefono). Sta sul dispositivo, come l'onboarding visto: deve valere
 * anche prima dell'accesso, sulle schermate di login e registrazione.
 */
const CHIAVE = 'swipick:lingua';

interface LinguaState {
  scelta: SceltaLingua;
  /** La lingua effettiva, dopo aver risolto "automatica". */
  lingua: Lingua;
  carica: () => Promise<void>;
  imposta: (scelta: SceltaLingua) => Promise<void>;
}

const valida = (v: string | null): SceltaLingua | null =>
  v === 'auto' || v === 'it' || v === 'en' ? v : null;

export const useLinguaStore = create<LinguaState>((set) => ({
  scelta: 'auto',
  lingua: risolviLingua('auto'),

  carica: async () => {
    let scelta: SceltaLingua = 'auto';
    try {
      scelta = valida(await AsyncStorage.getItem(CHIAVE)) ?? 'auto';
    } catch {
      // Senza memoria si segue il telefono: è comunque una scelta sensata.
    }
    const lingua = risolviLingua(scelta);
    set({ scelta, lingua });
    if (i18n.language !== lingua) await i18n.changeLanguage(lingua);
  },

  imposta: async (scelta) => {
    const lingua = risolviLingua(scelta);
    set({ scelta, lingua });
    await i18n.changeLanguage(lingua);
    try {
      await AsyncStorage.setItem(CHIAVE, scelta);
    } catch {
      // Vale per questa sessione; al prossimo avvio si riparte dal telefono.
    }
  },
}));
