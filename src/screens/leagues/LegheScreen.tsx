import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLeaguesStore } from '../../store/stores/useLeaguesStore';
import { LeagueSummary } from '../../types/league.types';
import {
  GradientHeader,
  LeagueAvatar,
  PrimaryButton,
  GhostButton,
  ErrorNote,
  leagueStyles,
  leagueColors,
} from '../../components/leagues/LeagueUI';
import { useTranslation } from 'react-i18next';
import GuestCTA from '../../components/common/GuestCTA';
import { useAuthStore } from '../../store/stores/useAuthStore';

type Props = {
  navigation?: { navigate: (screen: any, params?: any) => void };
};

/** Una riga dell'elenco: nome, posizione, punti. */
function LeagueRow({ league, onPress }: { league: LeagueSummary; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[leagueStyles.card, styles.leagueCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leagueTop}>
        <View style={styles.leagueNameBox}>
          <Text style={styles.leagueName} numberOfLines={1}>
            {league.name}
          </Text>
          <Text style={styles.leagueMeta}>
            Serie A · {t('leghePagina.membri', { count: league.memberCount })}
          </Text>
        </View>

        {league.myPending ? (
          <Text style={styles.pendingBadge}>{t('leghePagina.inAttesa')}</Text>
        ) : (
          <View style={styles.positionBox}>
            <Text style={styles.position}>
              {league.myPosition ?? '—'}
              <Text style={styles.positionOrdinal}>º</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={styles.leagueBottom}>
        <View style={styles.facce}>
          {league.memberPreview.map((nickname, i) => (
            <View
              key={`${nickname ?? 'anonimo'}-${i}`}
              style={i > 0 ? styles.faccaSovrapposta : undefined}
            >
              <LeagueAvatar nickname={nickname} size={28} />
            </View>
          ))}
          {league.memberCount > league.memberPreview.length && (
            <View style={[styles.faccaSovrapposta, styles.altri]}>
              <Text style={styles.altriTesto}>
                +{league.memberCount - league.memberPreview.length}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.leaguePoints}>
          {league.myPending
            ? t('leghePagina.partiProssima')
            : t('leghePagina.puntiStagione', { punti: league.myPoints })}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#b9b9c2" />
      </View>
    </TouchableOpacity>
  );
}

export default function LegheScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const leagues = useLeaguesStore((s) => s.leagues);
  const loading = useLeaguesStore((s) => s.loading);
  const error = useLeaguesStore((s) => s.error);
  const loadLeagues = useLeaguesStore((s) => s.loadLeagues);
  const user = useAuthStore((s) => s.user);

  // Le leghe esistono solo con un account: senza, il server rispondeva
  // "Token di accesso mancante" e l'ospite vedeva un errore invece di un invito.
  useEffect(() => {
    if (user) loadLeagues();
  }, [loadLeagues, user]);

  if (!user) {
    return (
      <View style={[leagueStyles.screen, leagueStyles.center]}>
        <GuestCTA
          title={t('leghePagina.ospiteTitolo')}
          message={t('leghePagina.ospiteMessaggio')}
        />
      </View>
    );
  }

  const apri = (leagueId: string) => navigation?.navigate('dettaglio-lega', { leagueId });

  const vuoto = !loading && leagues.length === 0 && !error;

  return (
    <View style={leagueStyles.screen}>
      <GradientHeader>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>{t('leghePagina.titolo')}</Text>
          <TouchableOpacity
            style={styles.headerSide}
            onPress={() => navigation?.navigate('crea-lega')}
            accessibilityLabel={t('leghePagina.creaLega')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.addButton}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      </GradientHeader>

      <ScrollView
        contentContainerStyle={[leagueStyles.content, styles.scroll]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadLeagues} />}
      >
        <ErrorNote message={error} />

        {loading && leagues.length === 0 && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={leagueColors.primary} />
          </View>
        )}

        {vuoto && (
          <View style={[leagueStyles.card, styles.emptyCard]}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people" size={30} color="#7c3aed" />
            </View>
            <Text style={styles.emptyTitle}>{t('leghePagina.nessunaLega')}</Text>
            <Text style={styles.emptyText}>{t('leghePagina.cosaELega')}</Text>
          </View>
        )}

        {leagues.map((league) => (
          <LeagueRow key={league.id} league={league} onPress={() => apri(league.id)} />
        ))}

        <PrimaryButton
          label={t('leghePagina.creaLega')}
          onPress={() => navigation?.navigate('crea-lega')}
          style={styles.cta}
        />
        <GhostButton
          label={t('leghePagina.hoInvito')}
          onPress={() => navigation?.navigate('unisciti')}
        />

        <Text style={[leagueStyles.footnote, styles.note]}>{t('leghePagina.soloInvito')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: 34,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 110, // la barra in fondo è sovrapposta
  },
  loading: {
    paddingVertical: 48,
  },
  leagueCard: {
    padding: 16,
  },
  leagueTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  leagueNameBox: {
    flex: 1,
    minWidth: 0,
  },
  leagueName: {
    fontSize: 17,
    fontWeight: '700',
    color: leagueColors.text,
  },
  leagueMeta: {
    marginTop: 4,
    fontSize: 13,
    color: leagueColors.textMuted,
  },
  positionBox: {
    alignItems: 'flex-end',
  },
  position: {
    fontSize: 24,
    fontWeight: '800',
    color: leagueColors.text,
  },
  positionOrdinal: {
    fontSize: 14,
    fontWeight: '800',
  },
  pendingBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: leagueColors.warn,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  leagueBottom: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: leagueColors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  facce: {
    flexDirection: 'row',
  },
  faccaSovrapposta: {
    // Si sovrappongono come nel disegno: la fila occupa meno e si legge come
    // un gruppo, non come un elenco.
    marginLeft: -10,
  },
  altri: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  altriTesto: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  leaguePoints: {
    flex: 1,
    fontSize: 13,
    color: leagueColors.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    marginTop: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: leagueColors.text,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: leagueColors.textSoft,
    textAlign: 'center',
  },
  cta: {
    marginTop: 4,
  },
  note: {
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
});
