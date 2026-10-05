import React, { useEffect, useState } from 'react';
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
import { leaguesApi } from '../../services/api/leagues';
import { StandingRow } from '../../types/league.types';
import {
  GradientHeader,
  LeagueAvatar,
  PrimaryButton,
  GhostButton,
  ErrorNote,
  leagueStyles,
  leagueColors,
} from '../../components/leagues/LeagueUI';

type Props = {
  navigation?: { navigate: (screen: any, params?: any) => void; goBack: () => void };
  leagueId: string;
  /** Nickname di chi guarda: serve a evidenziare la sua riga. */
  nickname?: string | null;
};

type Scope = 'season' | 'week';

function Riga({ row, me }: { row: StandingRow; me: boolean }) {
  return (
    <View style={[styles.row, me && styles.rowMe]}>
      <Text style={[styles.position, me && styles.positionMe]}>{row.position ?? '—'}</Text>
      <LeagueAvatar nickname={row.nickname} dimmed={row.pending} />
      <View style={styles.rowName}>
        <Text
          style={[styles.nickname, me && styles.nicknameMe, row.pending && styles.nicknameDim]}
          numberOfLines={1}
        >
          {row.nickname ? `@${row.nickname}` : 'senza nickname'}
          {me ? <Text style={styles.you}> · tu</Text> : null}
        </Text>
        {row.pending ? (
          <Text style={styles.rowNote}>entra dalla giornata {row.joinedFromWeek}</Text>
        ) : row.joinedFromWeek > 1 ? (
          <Text style={styles.rowNote}>dalla giornata {row.joinedFromWeek}</Text>
        ) : null}
      </View>
      <Text style={styles.percent}>{row.pending ? '—' : `${row.percent}%`}</Text>
      <Text style={[styles.points, row.pending && styles.nicknameDim]}>
        {row.pending ? '—' : row.points}
      </Text>
    </View>
  );
}

export default function DettaglioLegaScreen({ navigation, leagueId, nickname }: Props) {
  const detail = useLeaguesStore((s) => s.detail);
  const detailLoading = useLeaguesStore((s) => s.detailLoading);
  const detailError = useLeaguesStore((s) => s.detailError);
  const openLeague = useLeaguesStore((s) => s.openLeague);

  const [scope, setScope] = useState<Scope>('season');
  const [weekRows, setWeekRows] = useState<StandingRow[] | null>(null);
  const [weekBusy, setWeekBusy] = useState(false);
  const [weekError, setWeekError] = useState<string | null>(null);

  useEffect(() => {
    openLeague(leagueId);
  }, [leagueId, openLeague]);

  const mostraGiornata = async () => {
    setScope('week');
    if (weekRows) return;
    setWeekBusy(true);
    setWeekError(null);
    try {
      // Senza `week` il BFF usa la giornata in corso.
      const rows = await leaguesApi.standings(leagueId, 'week');
      setWeekRows(rows);
    } catch (err: any) {
      setWeekError(err?.message ?? 'Non riesco a caricare la giornata');
    } finally {
      setWeekBusy(false);
    }
  };

  const rows = scope === 'season' ? (detail?.standings ?? []) : (weekRows ?? []);

  if (detailLoading && !detail) {
    return (
      <View style={[leagueStyles.screen, leagueStyles.center]}>
        <ActivityIndicator size="large" color={leagueColors.primary} />
        <Text style={styles.loadingText}>Caricamento lega…</Text>
      </View>
    );
  }

  if (detailError && !detail) {
    return (
      <View style={[leagueStyles.screen, leagueStyles.center]}>
        <Ionicons name="alert-circle-outline" size={56} color="#dc2626" />
        <Text style={styles.errorText}>{detailError}</Text>
        <PrimaryButton label="Riprova" onPress={() => openLeague(leagueId)} style={styles.retry} />
      </View>
    );
  }

  if (!detail) return <View style={leagueStyles.screen} />;

  return (
    <View style={leagueStyles.screen}>
      <GradientHeader>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Indietro"
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {detail.name}
            </Text>
            <Text style={styles.headerMeta}>
              Serie A · {detail.memberCount} {detail.memberCount === 1 ? 'membro' : 'membri'} ·
              classifica di stagione
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, scope === 'season' && styles.tabOn]}
            onPress={() => setScope('season')}
          >
            <Text style={[styles.tabText, scope === 'season' && styles.tabTextOn]}>Stagione</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, scope === 'week' && styles.tabOn]}
            onPress={mostraGiornata}
          >
            <Text style={[styles.tabText, scope === 'week' && styles.tabTextOn]}>
              Giornata in corso
            </Text>
          </TouchableOpacity>
        </View>
      </GradientHeader>

      <ScrollView
        contentContainerStyle={leagueStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={detailLoading}
            onRefresh={() => {
              setWeekRows(null);
              openLeague(leagueId);
            }}
          />
        }
      >
        <ErrorNote message={scope === 'week' ? weekError : detailError} />

        {weekBusy && scope === 'week' ? (
          <View style={styles.weekLoading}>
            <ActivityIndicator color={leagueColors.primary} />
          </View>
        ) : (
          <View style={[leagueStyles.card, leagueStyles.cardFlush]}>
            {/* Le due colonne numeriche hanno un nome: senza, il numero in
                grassetto non dice di cosa sia la quantità. Le parole sono
                quelle già in uso altrove nell'app. */}
            <View style={styles.intestazione}>
              <View style={styles.intestazionePos} />
              <View style={styles.intestazioneAvatar} />
              <Text style={styles.etichettaNome}>Giocatore</Text>
              <Text style={styles.etichettaPercent} numberOfLines={1}>
                Media
              </Text>
              <Text style={styles.etichettaPunti} numberOfLines={1}>
                Giusti
              </Text>
            </View>
            {rows.map((row) => (
              <Riga
                key={row.userId}
                row={row}
                me={Boolean(nickname && row.nickname === nickname)}
              />
            ))}
            <Text style={styles.tableNote}>
              {scope === 'season'
                ? 'La classifica va per pronostici giusti. La media è sulle partite già scoperte, che per chi è entrato dopo sono meno.'
                : 'Solo la giornata in corso.'}
            </Text>
          </View>
        )}

        {/* Le due azioni di chi gestisce stanno qui, affiancate: un menu in
            alto a destra le nasconderebbe dietro tre puntini che non dicono
            cosa c'è sotto. */}
        {detail.isOwner && (
          <View style={styles.actions}>
            <PrimaryButton
              label="Invita un amico"
              onPress={() => navigation?.navigate('invita', { leagueId: detail.id })}
              style={styles.action}
            />
            <GhostButton
              label="Gestisci"
              onPress={() => navigation?.navigate('gestione-lega', { leagueId: detail.id })}
              style={styles.action}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerMeta: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  tabOn: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabTextOn: {
    color: '#3d2d73',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: leagueColors.divider,
  },
  rowMe: {
    backgroundColor: '#F5F3FF',
  },
  position: {
    width: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: leagueColors.textMuted,
  },
  positionMe: {
    color: leagueColors.brandDeep,
  },
  rowName: {
    flex: 1,
    minWidth: 0,
  },
  nickname: {
    fontSize: 15,
    color: leagueColors.text,
  },
  nicknameMe: {
    fontWeight: '700',
  },
  nicknameDim: {
    color: leagueColors.textFaint,
  },
  you: {
    fontSize: 13,
    fontWeight: '600',
    color: leagueColors.brandDeep,
  },
  rowNote: {
    marginTop: 2,
    fontSize: 12,
    color: leagueColors.textFaint,
  },
  percent: {
    width: 44,
    textAlign: 'right',
    fontSize: 13,
    color: leagueColors.textMuted,
  },
  points: {
    width: 58,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '700',
    color: leagueColors.text,
  },
  intestazione: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  intestazionePos: {
    width: 20,
  },
  intestazioneAvatar: {
    width: 32,
  },
  etichettaNome: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: leagueColors.textFaint,
    textTransform: 'uppercase',
  },
  etichettaPercent: {
    width: 44,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: leagueColors.textFaint,
    textTransform: 'uppercase',
  },
  etichettaPunti: {
    width: 58,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: leagueColors.textFaint,
    textTransform: 'uppercase',
  },
  tableNote: {
    padding: 16,
    fontSize: 12,
    color: leagueColors.textFaint,
  },
  weekLoading: {
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: leagueColors.textMuted,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  retry: {
    alignSelf: 'stretch',
  },
});
