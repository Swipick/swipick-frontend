import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { PixelPlayerLogo } from '../../components/game/PixelPlayerLogo';

/**
 * Mockup "vivi" per le slide 2 e 3 del wizard di onboarding (LandingScreen).
 * Sostituiscono le vecchie immagini statiche (landinScroll1/2.png) che avevano
 * gli stemmi stampati dentro: qui le squadre sono rese con gli omini pixel,
 * coerenti con le sezioni Gioca e Risultati.
 */

const { height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 750;

const SPRITE = isSmallScreen ? 34 : 40;

type Choice = '1' | 'X' | '2';

// ---- Slide 2: "Pronostica le partite" -----------------------------------

function ChoiceButtons({ selected }: { selected: Choice }) {
  return (
    <View style={styles.choiceCol}>
      {(['1', 'X', '2'] as Choice[]).map((c) => {
        const active = c === selected;
        return (
          <View key={c} style={[styles.choice, active ? styles.choiceOn : styles.choiceOff]}>
            <Text style={[styles.choiceTxt, active && styles.choiceTxtOn]}>{c}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MatchCard({
  home,
  away,
  date,
  selected,
}: {
  home: string;
  away: string;
  date: string;
  selected: Choice;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.teamsCol}>
        <View style={styles.teamRow}>
          <View style={styles.spriteBox}>
            <PixelPlayerLogo teamName={home} size={SPRITE} />
          </View>
          <Text style={styles.teamName} numberOfLines={1}>
            {home}
          </Text>
        </View>
        <View style={styles.teamRow}>
          <View style={styles.spriteBox}>
            <PixelPlayerLogo teamName={away} mirror size={SPRITE} />
          </View>
          <Text style={styles.teamName} numberOfLines={1}>
            {away}
          </Text>
        </View>
      </View>

      <View style={styles.datePill}>
        <Text style={styles.dateTxt}>{date}</Text>
      </View>

      <ChoiceButtons selected={selected} />
    </View>
  );
}

export function PredictSlide() {
  return (
    <View style={styles.slide}>
      <MatchCard home="Juventus" away="Napoli" date={'sab, 22/11\n18:00'} selected="1" />
      <MatchCard home="Atalanta" away="Fiorentina" date={'dom, 23/11\n15:00'} selected="X" />
    </View>
  );
}

// ---- Slide 3: "Guarda i risultati" --------------------------------------

function MiniMeter({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = 67;
  const strokeWidth = 12;
  const arcPath = 'M 14 82 A 67 67 0 0 1 146 82';
  const arcLength = radius * Math.PI;
  const progressLength = (arcLength * clamped) / 100;
  const dashArray = `${progressLength} ${arcLength}`;

  return (
    <View style={styles.meterWrap}>
      <Svg width={160} height={88} viewBox="0 0 160 88">
        <Defs>
          <SvgLinearGradient id="wizMeter" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#c4b5fd" />
            <Stop offset="100%" stopColor="#7c3aed" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={arcPath}
          stroke="#ece9f7"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={arcPath}
          stroke="url(#wizMeter)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
        />
      </Svg>
      <Text style={styles.meterPct}>{clamped}%</Text>
    </View>
  );
}

function ResultRow({ team, score, mirror }: { team: string; score: number; mirror?: boolean }) {
  return (
    <View style={styles.teamRow}>
      <View style={styles.spriteBox}>
        <PixelPlayerLogo teamName={team} mirror={mirror} size={SPRITE} />
      </View>
      <Text style={[styles.teamName, styles.resultName]} numberOfLines={1}>
        {team}
      </Text>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
}

export function ResultSlide() {
  return (
    <View style={styles.slide}>
      <View style={styles.card}>
        <View style={styles.teamsCol}>
          <ResultRow team="Roma" score={0} />
          <ResultRow team="Inter" score={1} mirror />
        </View>
        <View style={styles.finalPill}>
          <Text style={styles.finalTxt}>FINE{'\n'}PARTITA</Text>
        </View>
      </View>

      <MiniMeter percent={70} />
      <Text style={styles.meterDidascalia}>7 giusti su 10 in questa giornata</Text>

      <View style={styles.shareBtn}>
        <Ionicons name="share-outline" size={18} color="#fff" />
        <Text style={styles.shareTxt}>Condividi risultato</Text>
      </View>
    </View>
  );
}

// ---- Slide 4: "Sfida i tuoi amici" --------------------------------------

function RigaClassifica({
  posizione,
  iniziale,
  tinta,
  nickname,
  giusti,
  io,
}: {
  posizione: string;
  iniziale: string;
  tinta: string;
  nickname: string;
  giusti: number;
  io?: boolean;
}) {
  return (
    <View style={[styles.legaRiga, io && styles.legaRigaIo]}>
      <Text style={styles.legaPos}>{posizione}</Text>
      <View style={[styles.legaAvatar, { backgroundColor: tinta }]}>
        <Text style={styles.legaAvatarTxt}>{iniziale}</Text>
      </View>
      <Text style={[styles.legaNick, io && styles.legaNickIo]} numberOfLines={1}>
        {nickname}
      </Text>
      <Text style={styles.legaGiusti}>{giusti}</Text>
    </View>
  );
}

/**
 * Dal codice nasce la classifica: le due cose stanno una sopra l'altra con
 * una freccia in mezzo, così il meccanismo si legge senza didascalia.
 */
export function LeagueSlide() {
  return (
    <View style={styles.slide}>
      <View style={styles.codiceBox}>
        <Text style={styles.codiceEtichetta}>codice</Text>
        <Text style={styles.codice}>K7M2</Text>
      </View>

      <Ionicons name="arrow-down" size={22} color="#c4b5fd" />

      <View style={styles.legaCard}>
        <Text style={styles.legaTitolo}>Amici del bar</Text>
        <RigaClassifica posizione="1" iniziale="M" tinta="#8b5cf6" nickname="@marti" giusti={47} />
        <RigaClassifica
          posizione="2"
          iniziale="Z"
          tinta="#6f49ff"
          nickname="@zeno"
          giusti={44}
          io
        />
        <RigaClassifica posizione="3" iniziale="L" tinta="#6366f1" nickname="@luca" giusti={42} />
        <Text style={styles.legaNota}>La classifica si somma per tutta la stagione.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    width: isSmallScreen ? 300 : 330,
  },
  teamsCol: {
    flex: 1,
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spriteBox: {
    width: isSmallScreen ? 32 : 40,
    height: isSmallScreen ? 40 : 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  resultName: {
    flex: 0,
    width: isSmallScreen ? 90 : 110,
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    minWidth: 22,
    textAlign: 'center',
  },
  datePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  dateTxt: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
  },
  choiceCol: {
    gap: 6,
    alignItems: 'center',
  },
  choice: {
    minWidth: 34,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: {
    backgroundColor: '#4d32b1',
    borderColor: '#4d32b1',
  },
  choiceOff: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  choiceTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  choiceTxtOn: {
    color: '#FFFFFF',
  },
  finalPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 10,
    justifyContent: 'center',
  },
  finalTxt: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  meterDidascalia: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: -8,
  },
  codiceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ddd7f0',
    backgroundColor: '#fbfaff',
  },
  codiceEtichetta: {
    fontSize: 12,
    color: '#6B7280',
  },
  codice: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 5,
    color: '#4d32b1',
  },
  legaCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  legaTitolo: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  legaRiga: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  legaRigaIo: {
    backgroundColor: '#F5F3FF',
  },
  legaPos: {
    width: 14,
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  legaAvatar: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legaAvatarTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legaNick: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  legaNickIo: {
    fontWeight: '700',
  },
  legaGiusti: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  legaNota: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 11,
    color: '#9ca3af',
  },
  meterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterPct: {
    position: 'absolute',
    top: 40,
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4d32b1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  shareTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
