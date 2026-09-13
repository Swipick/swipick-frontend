import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileApi } from '../../services/api/profile';
import { authService } from '../../services/auth/authService';
import { useAuthStore } from '../../store/stores/useAuthStore';
import {
  normalizeSummaryResponse,
  calculateProfileKPIs,
} from '../../utils/profileCalculations';

type EliminaAccountScreenProps = {
  navigation?: { goBack: () => void };
  userId: string;
  nickname: string | null;
};

export default function EliminaAccountScreen({
  navigation,
  userId,
  nickname,
}: EliminaAccountScreenProps) {
  const user = useAuthStore((s) => s.user);

  const [conferma, setConferma] = useState('');
  const [deleting, setDeleting] = useState(false);
  // Numeri veri: dire cosa si perde è metà dell'avviso. Se non arrivano, la
  // lista resta generica — meglio vaga che sbagliata.
  const [totali, setTotali] = useState<{
    predictions: number;
    weeks: number;
  } | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await profileApi.getUserSummary(user.uid, 'live');
        const kpi = calculateProfileKPIs(normalizeSummaryResponse(response));
        if (cancelled) return;
        setTotali({ predictions: kpi.finished, weeks: kpi.weeksPlayed });
      } catch (err) {
        console.warn('[EliminaAccountScreen] Riepilogo non disponibile:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // Scrivere il nickname rende l'eliminazione impossibile per sbaglio e
  // banale di proposito. Senza nickname si ripiega sulla parola "elimina":
  // un campo che accetta qualunque cosa non sarebbe una conferma.
  const atteso = (nickname ?? 'elimina').toLowerCase();
  const puoEliminare = conferma.trim().toLowerCase() === atteso && !deleting;

  const handleDelete = async () => {
    if (!puoEliminare) return;

    try {
      setDeleting(true);

      const token = await authService.getIdToken();
      if (!token) {
        Alert.alert('Errore', "Serve un accesso valido per eliminare l'account.");
        setDeleting(false);
        return;
      }

      await profileApi.deleteAccount(userId, token);

      // Da qui in poi l'account non esiste piu': l'uscita chiude il giro e
      // AppNavigator riporta da solo alla schermata d'ingresso.
      await authService.signOut();
    } catch (error: any) {
      console.error('[EliminaAccountScreen] Delete failed:', error);
      Alert.alert('Errore', error?.message || 'Eliminazione non riuscita');
      setDeleting(false);
    }
  };

  const righe = [
    totali && totali.predictions > 0
      ? `I tuoi ${totali.predictions} pronostici e lo storico delle ${totali.weeks} giornate giocate`
      : 'Il tuo storico di gioco',
    nickname
      ? `Il nickname @${nickname}, che tornerà disponibile per altri`
      : 'Il tuo nickname, che tornerà disponibile per altri',
    'La tua foto profilo e le preferenze',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          disabled={deleting}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Elimina account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cosa viene cancellato</Text>
          <Text style={styles.cardSubtitle}>
            Definitivamente, senza possibilità di recupero.
          </Text>

          <View style={styles.list}>
            {righe.map((riga) => (
              <View key={riga} style={styles.listRow}>
                <Ionicons name="close" size={17} color="#b91c1c" style={styles.listIcon} />
                <Text style={styles.listText}>{riga}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.confirmIntro}>
            Per confermare, scrivi{' '}
            <Text style={styles.confirmWord}>{atteso}</Text> qui sotto.
          </Text>
          <TextInput
            style={styles.input}
            placeholder={atteso}
            placeholderTextColor="#c4c4cc"
            value={conferma}
            onChangeText={setConferma}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!deleting}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation?.goBack()}
            disabled={deleting}
          >
            <Text style={styles.cancelText}>Annulla</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, !puoEliminare && styles.deleteButtonOff]}
            onPress={handleDelete}
            disabled={!puoEliminare}
          >
            {deleting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                style={[styles.deleteText, !puoEliminare && styles.deleteTextOff]}
              >
                Elimina definitivamente
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 26,
  },
  scroll: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    padding: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  listIcon: {
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  confirmIntro: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 14,
  },
  confirmWord: {
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
  // Annulla sta sopra: e' l'uscita, e deve essere la piu' facile da trovare.
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  deleteButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#b91c1c',
  },
  deleteButtonOff: {
    backgroundColor: '#f3f4f6',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteTextOff: {
    color: '#c4c4cc',
  },
});
