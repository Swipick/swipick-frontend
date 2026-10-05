import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { leaguesApi } from '../../services/api/leagues';
import { useLeaguesStore } from '../../store/stores/useLeaguesStore';
import { InvitePreview } from '../../types/league.types';
import {
  LeagueAvatar,
  PrimaryButton,
  ErrorNote,
  leagueColors,
} from '../../components/leagues/LeagueUI';

const { height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 750;

type Props = {
  navigation?: { navigate: (screen: any, params?: any) => void; goBack: () => void };
  code: string;
  preview: InvitePreview;
};

/**
 * La lega trovata, prima di entrarci.
 *
 * Sta sul gradiente delle schermate di accesso e non su quelle di dati: è un
 * momento di benvenuto, non una tabella. Dice anche da quale giornata si
 * comincia, perché scoprirlo dopo sembrerebbe un errore dell'app.
 */
export default function ConfermaInvitoScreen({ navigation, code, preview }: Props) {
  const loadLeagues = useLeaguesStore((s) => s.loadLeagues);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entra = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { leagueId } = await leaguesApi.acceptInvite(code);
      await loadLeagues();
      navigation?.navigate('dettaglio-lega', { leagueId });
    } catch (err: any) {
      setError(err?.message ?? 'Non riesco a farti entrare');
    } finally {
      setBusy(false);
    }
  };

  const giaDentro = preview.alreadyMember;

  return (
    <LinearGradient colors={['#52418d', '#7a57f6']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>SWIPICK</Text>
          <Text style={styles.step}>Invito</Text>
        </View>

        <View style={styles.middle}>
          <View style={styles.card}>
            <View style={styles.avatars}>
              <LeagueAvatar nickname={preview.name} size={44} />
            </View>

            <Text style={styles.from}>
              {preview.ownerNickname
                ? `@${preview.ownerNickname} ti ha invitato in`
                : 'Ti hanno invitato in'}
            </Text>
            <Text style={styles.title}>{preview.name}</Text>
            <Text style={styles.meta}>
              Serie A · {preview.memberCount} {preview.memberCount === 1 ? 'membro' : 'membri'}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.body}>
              Pronosticate le stesse partite e vi confrontate in classifica, giornata dopo giornata.
            </Text>

            <ErrorNote message={error} />

            {giaDentro ? (
              <PrimaryButton
                label="Vai alla lega"
                onPress={() =>
                  navigation?.navigate('dettaglio-lega', {
                    leagueId: preview.leagueId,
                  })
                }
                style={styles.cta}
              />
            ) : (
              <PrimaryButton
                label="Entra nella lega"
                onPress={entra}
                busy={busy}
                disabled={preview.full}
                style={styles.cta}
              />
            )}

            <Text style={styles.note}>
              {giaDentro
                ? 'Sei già in questa lega.'
                : preview.full
                  ? 'Questa lega è piena.'
                  : `Entrerai in classifica dalla giornata ${preview.joinFromWeek}.`}
            </Text>
          </View>

          <TouchableOpacity style={styles.back} onPress={() => navigation?.goBack()}>
            <Text style={styles.backText}>Non è questa, cambio codice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: isSmallScreen ? 40 : 50,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  wordmark: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2.5,
  },
  step: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 6,
  },
  avatars: {
    alignItems: 'center',
    marginBottom: 16,
  },
  from: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  title: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '700',
    color: leagueColors.text,
    textAlign: 'center',
  },
  meta: {
    marginTop: 8,
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 20,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: leagueColors.textSoft,
    textAlign: 'center',
    marginBottom: 20,
  },
  cta: {
    marginTop: 4,
  },
  note: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 19,
    color: leagueColors.textMuted,
    textAlign: 'center',
  },
  back: {
    alignItems: 'center',
    marginTop: 18,
    padding: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
