import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MatchCard as MatchCardType } from '../../types/game.types';
import { colors, spacing } from '../../theme';
import {
  formatKickoffTime,
  formatWinRate,
  getTeamLogoFallback,
  formatLastResult,
} from '../../utils/formatters';
import { getTeamLogo } from '../../utils/logoMapper';

interface MatchCardProps {
  matchCard: MatchCardType;
}

export default function MatchCard({ matchCard }: MatchCardProps) {
  const { home, away, kickoff, stadium } = matchCard;

  // Get local logo assets
  const homeTeamLogo = getTeamLogo(home.logo);
  const awayTeamLogo = getTeamLogo(away.logo);

  const homeTeam = {
    name: home.name,
    logo: homeTeamLogo,
    position: home.standingsPosition,
    winRate: home.winRateHome,
    last5: home.last5,
  };
  const awayTeam = {
    name: away.name,
    logo: awayTeamLogo,
    position: away.standingsPosition,
    winRate: away.winRateAway,
    last5: away.last5,
  };
  const kickoffTime = kickoff.iso;

  return (
    <View style={styles.container}>
      {/* Header - Match Details */}
      <View style={styles.header}>
        <Text style={styles.kickoffTime}>{formatKickoffTime(kickoffTime)}</Text>
        {stadium && <Text style={styles.stadium}>{stadium}</Text>}
      </View>

      {/* Teams Section */}
      <View style={styles.teamsContainer}>
        {/* Home Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamHeader}>
            {homeTeam.logo ? (
              <Image source={homeTeam.logo} style={styles.teamLogo} />
            ) : (
              <View style={[styles.teamLogo, styles.logoFallback]}>
                <Text style={styles.logoFallbackText}>
                  {getTeamLogoFallback(homeTeam.name)}
                </Text>
              </View>
            )}
            <View style={styles.teamInfo}>
              <Text style={styles.teamName} numberOfLines={2}>
                {homeTeam.name}
              </Text>
              {homeTeam.position && (
                <Text style={styles.position}>#{homeTeam.position}</Text>
              )}
            </View>
          </View>

          {/* Home Stats */}
          <View style={styles.stats}>
            {homeTeam.winRate !== undefined && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Casa:</Text>
                <Text style={styles.statValue}>
                  {formatWinRate(homeTeam.winRate)}
                </Text>
              </View>
            )}

            {/* Last 5 Home Results */}
            {homeTeam.last5 && homeTeam.last5.length > 0 && (
              <View style={styles.last5Container}>
                {homeTeam.last5.slice(0, 5).map((result, index) => {
                  const formatted = formatLastResult(result);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.resultBadge,
                        { backgroundColor: formatted.color },
                      ]}
                    >
                      <Text style={styles.resultText}>{formatted.text}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* VS Divider */}
        <View style={styles.divider}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={styles.teamHeader}>
            {awayTeam.logo ? (
              <Image source={awayTeam.logo} style={styles.teamLogo} />
            ) : (
              <View style={[styles.teamLogo, styles.logoFallback]}>
                <Text style={styles.logoFallbackText}>
                  {getTeamLogoFallback(awayTeam.name)}
                </Text>
              </View>
            )}
            <View style={styles.teamInfo}>
              <Text style={styles.teamName} numberOfLines={2}>
                {awayTeam.name}
              </Text>
              {awayTeam.position && (
                <Text style={styles.position}>#{awayTeam.position}</Text>
              )}
            </View>
          </View>

          {/* Away Stats */}
          <View style={styles.stats}>
            {awayTeam.winRate !== undefined && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Trasferta:</Text>
                <Text style={styles.statValue}>
                  {formatWinRate(awayTeam.winRate)}
                </Text>
              </View>
            )}

            {/* Last 5 Away Results */}
            {awayTeam.last5 && awayTeam.last5.length > 0 && (
              <View style={styles.last5Container}>
                {awayTeam.last5.slice(0, 5).map((result, index) => {
                  const formatted = formatLastResult(result);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.resultBadge,
                        { backgroundColor: formatted.color },
                      ]}
                    >
                      <Text style={styles.resultText}>{formatted.text}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kickoffTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  stadium: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  venue: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
  },
  logoFallback: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  teamInfo: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  position: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stats: {
    alignItems: 'center',
    width: '100%',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  last5Container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  resultBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
});
