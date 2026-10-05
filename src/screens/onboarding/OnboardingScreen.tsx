import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

import { PredictSlide, ResultSlide, LeagueSlide } from './WizardMockups';
import { segnaOnboardingVisto } from '../../utils/onboardingVisto';

const { width: larghezzaSchermo, height: altezzaSchermo } = Dimensions.get('window');
const schermoPiccolo = altezzaSchermo < 750;

type Props = {
  /** Chiamata quando l'onboarding è finito o saltato. */
  onFine: () => void;
};

const PAGINE = [
  {
    titolo: 'Dieci partite, una giornata',
    testo:
      'Scegli 1, X o 2 su ogni partita del turno. Niente schedine e niente soldi: conta solo quante ne prendi.',
    Illustrazione: PredictSlide,
  },
  {
    titolo: 'Poi scopri com’è andata',
    testo:
      'A partita finita vedi il risultato e se l’avevi presa. A fine giornata, quante ne hai indovinate.',
    Illustrazione: ResultSlide,
  },
  {
    titolo: 'E sfidi i tuoi amici',
    testo: 'Crea una lega, manda il codice a chi vuoi, e vi confrontate giornata dopo giornata.',
    Illustrazione: LeagueSlide,
  },
];

/**
 * Le tre schermate che spiegano Swipick, prima dell'accesso.
 *
 * Stanno da sole di proposito: prima convivevano con i bottoni di accesso
 * sulla stessa pagina, e un carosello messo sopra un pulsante d'azione non
 * viene scorso quasi mai. Qui non c'è niente altro da toccare, tranne
 * «Salta» — che deve esserci, altrimenti diventa un pedaggio.
 */
export default function OnboardingScreen({ onFine }: Props) {
  const [pagina, setPagina] = useState(0);
  const scorrevole = useRef<ScrollView>(null);

  const ultima = pagina === PAGINE.length - 1;

  const chiudi = async () => {
    await segnaOnboardingVisto();
    onFine();
  };

  const avanti = () => {
    if (ultima) {
      chiudi();
      return;
    }
    scorrevole.current?.scrollTo({
      x: larghezzaSchermo * (pagina + 1),
      animated: true,
    });
  };

  const alloScorrimento = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const indice = Math.round(e.nativeEvent.contentOffset.x / larghezzaSchermo);
    if (indice !== pagina) setPagina(indice);
  };

  return (
    <View style={styles.contenitore}>
      <View style={styles.testa}>
        {/* Il wordmark solo sulla prima: dalla seconda in poi occuperebbe la
            riga senza aggiungere niente. */}
        {pagina === 0 ? <Text style={styles.wordmark}>swipick</Text> : <View />}
        <TouchableOpacity onPress={chiudi} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.salta}>Salta</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scorrevole}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={alloScorrimento}
        scrollEventThrottle={16}
        style={styles.pagine}
      >
        {PAGINE.map(({ titolo, testo, Illustrazione }) => (
          <View key={titolo} style={styles.pagina}>
            <View style={styles.illustrazione}>
              <Illustrazione />
            </View>
            <View>
              <Text style={styles.titolo}>{titolo}</Text>
              <Text style={styles.testo}>{testo}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.punti}>
        {PAGINE.map((p, i) => (
          <View key={p.titolo} style={[styles.punto, i === pagina && styles.puntoAttivo]} />
        ))}
      </View>

      <TouchableOpacity style={styles.avanti} onPress={avanti}>
        <Text style={styles.avantiTesto}>{ultima ? 'Comincia' : 'Avanti'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenitore: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: schermoPiccolo ? 40 : 60,
    paddingBottom: 40,
  },
  testa: {
    height: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5742a4',
    letterSpacing: -0.5,
  },
  salta: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  pagine: {
    flex: 1,
  },
  pagina: {
    width: larghezzaSchermo,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  illustrazione: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titolo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  testo: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 23,
    color: '#4b5563',
    textAlign: 'center',
  },
  punti: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 28,
  },
  punto: {
    width: 20,
    height: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(179, 172, 203, 0.3)',
  },
  puntoAttivo: {
    backgroundColor: '#4d32b1',
  },
  avanti: {
    height: 56,
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#4d32b1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avantiTesto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
