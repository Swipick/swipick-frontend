import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LastFiveResults } from './LastFiveResults';
import { getTeamLogoFallback, formatWinRate } from '../../utils/formatters';
import { FormEntry } from '../../types/game.types';

const { height: screenHeight } = Dimensions.get("window");
const isSmallScreen = screenHeight < 750;

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
  form?: FormEntry[];
  isHomeTeam?: boolean; // For legacy support
}

export function TeamInfo({
  team,
  standingsPosition,
  winRate,
  winRateLabel,
  last5,
  form,
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
      <LastFiveResults last5={last5} form={form} isHomeTeam={isHomeTeam} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: isSmallScreen ? 6 : 12,
    marginHorizontal: 'auto',
  },
  logo: {
    width: isSmallScreen ? 60 : 96,
    height: isSmallScreen ? 60 : 96,
  },
  logoFallback: {
    width: isSmallScreen ? 60 : 96,
    height: isSmallScreen ? 60 : 96,
    borderRadius: isSmallScreen ? 30 : 48,
    backgroundColor: '#DDD6FE', // purple-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFallbackText: {
    fontSize: isSmallScreen ? 24 : 36,
    fontWeight: '700',
    color: '#7C3AED', // purple-600
  },
  teamName: {
    fontSize: isSmallScreen ? 14 : 18,
    fontWeight: '700',
    lineHeight: isSmallScreen ? 16.8 : 21.6,
    color: '#000000',
    textAlign: 'center',
    marginBottom: isSmallScreen ? 2 : 4,
  },
  statContainer: {
    alignItems: 'center',
    marginTop: isSmallScreen ? 4 : 8,
  },
  statLabel: {
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: '400',
    color: '#000000',
  },
  statValue: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '700',
    color: '#000000',
    marginTop: isSmallScreen ? 2 : 4,
  },
});
