import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { useLeaguesStore } from '../../store/stores/useLeaguesStore';
import {
  SubHeader,
  PrimaryButton,
  GhostButton,
  ErrorNote,
  leagueStyles,
  leagueColors,
} from '../../components/leagues/LeagueUI';
import { oreRimanenti, testoScadenza } from '../../utils/inviteCountdown';
import { condividiEMisura } from '../../services/analytics';

type Props = {
  navigation?: { navigate: (screen: any, params?: any) => void; goBack: () => void };
  leagueId: string;
};

export default function InvitaScreen({ navigation, leagueId }: Props) {
  const detail = useLeaguesStore((s) => s.detail);
  const openLeague = useLeaguesStore((s) => s.openLeague);
  const rotateCode = useLeaguesStore((s) => s.rotateCode);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!detail || detail.id !== leagueId) openLeague(leagueId);
  }, [detail, leagueId, openLeague]);

  const code = detail?.inviteCode ?? null;
  const ore = oreRimanenti(detail?.inviteCodeExpiresAt ?? null);

  const copia = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    // Negli appunti il codice da solo, senza la frase intorno: chi incolla
    // lo fa nelle quattro caselle, non in un messaggio.
    setToast('Codice copiato');
    setTimeout(() => setToast(null), 2000);
  };

  const condividi = async () => {
    if (!code || !detail) return;
    await condividiEMisura({
      punto: 'lega',
      messaggio: `Ti invito nella lega "${detail.name}" su Swipick. Apri l'app, vai in Leghe e inserisci il codice ${code}. Vale ancora ${testoScadenza(ore)}.`,
    });
  };

  const rigenera = async () => {
    setBusy(true);
    setError(null);
    try {
      await rotateCode();
    } catch (err: any) {
      setError(err?.message ?? 'Non riesco a generare un codice nuovo');
    } finally {
      setBusy(false);
    }
  };

  if (!detail || detail.id !== leagueId) {
    return (
      <View style={leagueStyles.screen}>
        <SubHeader title="Invita" onBack={() => navigation?.goBack()} />
        <View style={leagueStyles.center}>
          <ActivityIndicator size="large" color={leagueColors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={leagueStyles.screen}>
      <SubHeader title="Invita" onBack={() => navigation?.goBack()} />

      <ScrollView contentContainerStyle={leagueStyles.content}>
        <ErrorNote message={error} />

        <View style={[leagueStyles.card, styles.codeCard]}>
          <Text style={styles.leagueName}>{detail.name}</Text>
          <Text style={styles.intro}>
            Detta questo codice a chi vuoi invitare. Lo inserisce in Swipick ed entra nella lega.
          </Text>

          <View style={styles.codeBox}>
            {code ? (
              <>
                <Text style={styles.code}>{code}</Text>
                <View style={styles.expiry}>
                  <Ionicons name="time-outline" size={13} color="#92400e" />
                  <Text style={styles.expiryText}>Scade fra {testoScadenza(ore)}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.noCode}>
                Gli inviti sono chiusi: genera un codice nuovo per riaprirli.
              </Text>
            )}
          </View>

          {code ? (
            <PrimaryButton label="Condividi invito" onPress={condividi} style={styles.share} />
          ) : null}

          {code ? (
            <View style={styles.secondari}>
              <GhostButton label="Copia" onPress={copia} style={styles.secondario} />
              <GhostButton
                label="Rigenera"
                onPress={rigenera}
                busy={busy}
                style={styles.secondario}
              />
            </View>
          ) : (
            <GhostButton
              label="Genera un codice"
              onPress={rigenera}
              busy={busy}
              style={styles.rotate}
            />
          )}

          <Text style={[leagueStyles.footnote, styles.note]}>
            Dopo 48 ore il codice smette di funzionare. Rigenerandolo, il vecchio muore subito.
          </Text>
        </View>

        <View style={[leagueStyles.card, leagueStyles.cardTight, styles.info]}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={leagueColors.textMuted}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Quattro caratteri si dettano al telefono, ma sono pochi contro i tentativi a caso: le 48
            ore di validità e il limite di cinque tentativi al minuto sono quello che tiene chiusa
            la porta.
          </Text>
        </View>
      </ScrollView>

      {toast && (
        <View style={styles.toastContainer}>
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    alignItems: 'center',
  },
  leagueName: {
    fontSize: 15,
    fontWeight: '600',
    color: leagueColors.text,
  },
  intro: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
    color: leagueColors.textSoft,
    textAlign: 'center',
  },
  codeBox: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ddd7f0',
    backgroundColor: '#fbfaff',
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  code: {
    fontSize: 44,
    fontWeight: '700',
    color: leagueColors.text,
    letterSpacing: 10,
    // La spaziatura spinge il testo a destra: il margine lo ricentra.
    marginLeft: 10,
  },
  expiry: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  noCode: {
    fontSize: 14,
    lineHeight: 20,
    color: leagueColors.textSoft,
    textAlign: 'center',
  },
  share: {
    alignSelf: 'stretch',
    marginTop: 16,
  },
  rotate: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
  secondari: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  secondario: {
    flex: 1,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(17,24,39,0.92)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  note: {
    marginTop: 14,
    textAlign: 'center',
  },
  info: {
    flexDirection: 'row',
    gap: 12,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: leagueColors.textSoft,
  },
});
