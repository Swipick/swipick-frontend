import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MatchCard, PredictionChoice } from '../../types/game.types';
import { colors, spacing } from '../../theme';
import { formatKickoffTime, getTeamLogoFallback } from '../../utils/formatters';
import { getTeamLogo } from '../../utils/logoMapper';

interface GameSummaryScreenProps {
  visible: boolean;
  fixtures: MatchCard[];
  predictions: Map<string, PredictionChoice>;
  onClose: () => void;
}

export default function GameSummaryScreen({
  visible,
  fixtures,
  predictions,
  onClose,
}: GameSummaryScreenProps) {
  const renderChoiceBadge = (
    choice: PredictionChoice,
    isSelected: boolean
  ) => {
    let label = '';
    switch (choice) {
      case '1':
        label = '1';
        break;
      case 'X':
        label = 'X';
        break;
      case '2':
        label = '2';
        break;
      case 'SKIP':
        label = 'Skip';
        break;
    }

    return (
      <View
        key={choice}
        style={[
          styles.choiceBadge,
          isSelected && styles.choiceBadgeSelected,
        ]}
      >
        <Text
          style={[
            styles.choiceText,
            isSelected && styles.choiceTextSelected,
          ]}
        >
          {label}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Riepilogo Previsioni</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Fixtures List */}
        <ScrollView style={styles.scrollView}>
          {fixtures.map((fixture) => {
            const userPrediction = predictions.get(fixture.fixtureId);
            const choices: PredictionChoice[] = ['1', 'X', '2'];

            // Get local logos
            const homeTeamLogo = getTeamLogo(fixture.home.logo);
            const awayTeamLogo = getTeamLogo(fixture.away.logo);

            return (
              <View key={fixture.fixtureId} style={styles.fixtureCard}>
                {/* Kickoff Time */}
                <View style={styles.timePill}>
                  <Text style={styles.timeText}>
                    {formatKickoffTime(fixture.kickoff.iso)}
                  </Text>
                </View>

                {/* Teams */}
                <View style={styles.teamsRow}>
                  {/* Home Team */}
                  <View style={styles.team}>
                    {homeTeamLogo ? (
                      <Image
                        source={homeTeamLogo}
                        style={styles.teamLogo}
                      />
                    ) : (
                      <View style={[styles.teamLogo, styles.logoFallback]}>
                        <Text style={styles.logoFallbackText}>
                          {getTeamLogoFallback(fixture.home.name)}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.teamName} numberOfLines={1}>
                      {fixture.home.name}
                    </Text>
                  </View>

                  <Text style={styles.vsText}>vs</Text>

                  {/* Away Team */}
                  <View style={styles.team}>
                    {awayTeamLogo ? (
                      <Image
                        source={awayTeamLogo}
                        style={styles.teamLogo}
                      />
                    ) : (
                      <View style={[styles.teamLogo, styles.logoFallback]}>
                        <Text style={styles.logoFallbackText}>
                          {getTeamLogoFallback(fixture.away.name)}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.teamName} numberOfLines={1}>
                      {fixture.away.name}
                    </Text>
                  </View>
                </View>

                {/* Choice Badges */}
                <View style={styles.choicesRow}>
                  {choices.map((choice) =>
                    renderChoiceBadge(choice, userPrediction === choice)
                  )}
                </View>

                {/* Skip Badge */}
                {userPrediction === 'SKIP' && (
                  <View style={styles.skipBadge}>
                    <Text style={styles.skipText}>Saltato</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  fixtureCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timePill: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  logoFallback: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFallbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  choiceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceBadgeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  choiceTextSelected: {
    color: '#fff',
  },
  skipBadge: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
