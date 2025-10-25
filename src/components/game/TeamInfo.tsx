import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LastFiveResults } from './LastFiveResults';
import { getTeamLogoFallback, formatWinRate } from '../../utils/formatters';

interface TeamInfoProps {
  team: {
    id?: number;
    name: string;
    logo: any; // Can be require() or { uri: string }
  };
  standingsPosition?: number | null;
  winRate?: number | null;
  winRateLabel: string; // "Vittorie in casa" or "Vittorie in trasferta"
  last5: string[];
  isHomeTeam: boolean;
}

export function TeamInfo({
  team,
  standingsPosition,
  winRate,
  winRateLabel,
  last5,
  isHomeTeam,
}: TeamInfoProps) {
  return (
    <View style={styles.container}>
      {/* Team Logo */}
      <View style={styles.logoContainer}>
        {team.logo ? (
          <Image source={team.logo} style={styles.logo} resizeMode="contain" />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoFallbackText}>
              {getTeamLogoFallback(team.name)}
            </Text>
          </View>
        )}
      </View>

      {/* Team Name */}
      <Text style={styles.teamName} numberOfLines={2}>
        {team.name}
      </Text>

      {/* Standing Position */}
      <View style={styles.statContainer}>
        <Text style={styles.statLabel}>Posizione in classifica</Text>
        <Text style={styles.statValue}>
          {standingsPosition !== null && standingsPosition !== undefined ? standingsPosition : '—'}
        </Text>
      </View>

      {/* Win Rate */}
      <View style={styles.statContainer}>
        <Text style={styles.statLabel}>{winRateLabel}</Text>
        <Text style={styles.statValue}>{formatWinRate(winRate)}</Text>
      </View>

      {/* Last 5 Results */}
      <LastFiveResults last5={last5} isHomeTeam={isHomeTeam} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 12,
    marginHorizontal: 'auto',
  },
  logo: {
    width: 96,
    height: 96,
  },
  logoFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DDD6FE', // purple-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFallbackText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#7C3AED', // purple-600
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 21.6,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  statContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#000000',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginTop: 4,
  },
});
