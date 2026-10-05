import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Se l'onboarding è già stato visto su questo telefono.
 *
 * Sta sul dispositivo e non sull'account di proposito: le tre schermate
 * servono a chi non sa cosa sia Swipick, e quello si decide prima di avere
 * un account. Chi esce e rientra non se le ritrova davanti.
 */
const CHIAVE = 'swipick:onboarding-visto';

/** In caso di dubbio si mostra: meglio una ripetizione che un'app incomprensibile. */
export async function onboardingGiaVisto(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CHIAVE)) === '1';
  } catch {
    return false;
  }
}

export async function segnaOnboardingVisto(): Promise<void> {
  try {
    await AsyncStorage.setItem(CHIAVE, '1');
  } catch {
    // Non riuscire a ricordarlo non deve impedire di proseguire: al massimo
    // le schermate si rivedono una volta di troppo.
  }
}
