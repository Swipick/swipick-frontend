import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { MatchCard, PredictionChoice } from '../../types/game.types';
import { getTeamLogo } from '../../utils/logoMapper';

interface GameSummaryScreenProps {
  fixtures: MatchCard[];
  predictions: Map<string, PredictionChoice>;
  headerHeight?: number;
}

// Team Logo Component with Fallback
function TeamLogo({ logoPath, teamName }: { logoPath?: string | null; teamName: string }) {
  // Get local asset from logoMapper (with team name fallback)
  // Convert undefined to null for getTeamLogo
  const localLogo = getTeamLogo(logoPath ?? null, teamName);

  // Debug: Log when logo is not found
  if (!localLogo) {
    console.log(`[TeamLogo] Logo not found for ${teamName}, path: "${logoPath}"`);
  }

  if (!localLogo) {
    return (
      <View style={styles.logoFallback}>
        <Text style={styles.logoFallbackText}>
          {teamName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={localLogo}
      style={styles.teamLogo}
      resizeMode="contain"
    />
  );
}

// Choice Badge Component
function ChoiceBadge({
  label,
  isSelected,
}: {
  label: '1' | 'X' | '2';
  isSelected: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        isSelected ? styles.badgeSelected : styles.badgeUnselected,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isSelected ? styles.badgeTextSelected : styles.badgeTextUnselected,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function GameSummaryScreen({
  fixtures,
  predictions,
  headerHeight = 160,
}: GameSummaryScreenProps) {
  const formatKickoff = (isoDate: string) => {
    const date = new Date(isoDate);

    // Format: "gio, 24/10, 20:45"
    const weekday = date.toLocaleDateString('it-IT', { weekday: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${weekday}, ${day}/${month}, ${hours}:${minutes}`;
  };

  return (
    <View style={styles.container}>
      {/* Header Spacer - prevents content from hiding under sticky header */}
      <View style={{ height: headerHeight + 24 }} />

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {fixtures.map((fixture) => {
            const prediction = predictions.get(fixture.fixtureId);
            const kickoff = formatKickoff(fixture.kickoff.iso);

            return (
              <View key={fixture.fixtureId} style={styles.card}>
                {/* Teams Section */}
                <View style={styles.teamsSection}>
                  {/* Home Team */}
                  <View style={styles.teamRow}>
                    <TeamLogo
                      logoPath={fixture.home.logo}
                      teamName={fixture.home.name}
                    />
                    <Text style={styles.teamName} numberOfLines={1}>
                      {fixture.home.name}
                    </Text>
                  </View>

                  {/* Away Team */}
                  <View style={styles.teamRow}>
                    <TeamLogo
                      logoPath={fixture.away.logo}
                      teamName={fixture.away.name}
                    />
                    <Text style={styles.teamName} numberOfLines={1}>
                      {fixture.away.name}
                    </Text>
                  </View>
                </View>

                {/* Kickoff Time Pill */}
                <View style={styles.kickoffPill}>
                  <Text style={styles.kickoffText}>{kickoff}</Text>
                </View>

                {/* Choice Badges Column */}
                <View style={styles.badgesColumn}>
                  <ChoiceBadge label="1" isSelected={prediction === '1'} />
                  <ChoiceBadge label="X" isSelected={prediction === 'X'} />
                  <ChoiceBadge label="2" isSelected={prediction === '2'} />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  // Screen Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for bottom nav
    alignItems: 'center',
  },

  // Card Styles
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    width: '100%',
    maxWidth: 448,
    alignItems: 'center',
  },

  // Teams Section
  teamsSection: {
    flex: 1,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLogo: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 24,
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE', // purple-100
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoFallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B21A8', // purple-800
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },

  // Kickoff Time Pill
  kickoffPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  kickoffText: {
    fontSize: 11,
    color: '#374151', // gray-700
    textAlign: 'center',
  },

  // Choice Badges
  badgesColumn: {
    gap: 8,
    alignItems: 'center',
  },
  badge: {
    minWidth: 36,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSelected: {
    backgroundColor: '#4F46E5', // indigo-600
    borderColor: '#4F46E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB', // gray-300
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  badgeTextUnselected: {
    color: '#374151', // gray-700
  },
});
