import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Spazio in basso per gli elementi fissati in fondo allo schermo.
 *
 * Su Android l'app disegna sotto la barra di navigazione (edge-to-edge), quindi
 * al margine pensato per iOS va sommata l'altezza della barra: con i tre
 * pulsanti sono 48 dp, abbastanza da coprire un pulsante. Su iOS il valore
 * resta quello di sempre.
 */
export function useSpazioInBasso(base: number): number {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'android' ? base + insets.bottom : base;
}
