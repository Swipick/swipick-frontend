import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LastFiveResultsProps {
  last5: string[];
  isHomeTeam: boolean;
}

/**
 * LastFiveResults - Shows 5 colored badges showing recent form
 *
 * Badge Display Logic:
 * - Shows position not result: "1" (home) or "2" (away)
 * - Colors based on outcome:
 *   🟢 Green = Win (team won)
 *   🔴 Red = Loss (team lost)
 *   ⚪ Gray = Draw or no data
 *
 * For home team:
 * - If match code = '1' (home won) → Green "1"
 * - If match code = 'X' (draw) → Gray "1"
 * - If match code = '2' (away won) → Red "1"
 *
 * For away team:
 * - If match code = '2' (away won) → Green "2"
 * - If match code = 'X' (draw) → Gray "2"
 * - If match code = '1' (home won) → Red "2"
 */
export function LastFiveResults({ last5, isHomeTeam }: LastFiveResultsProps) {
  const getBadgeStyle = (result: string) => {
    const upperResult = result.toUpperCase();
    const displayText = isHomeTeam ? '1' : '2';

    // Determine if this result is a win, loss, or draw for this team
    let type: 'win' | 'loss' | 'draw' = 'draw';

    if (isHomeTeam) {
      if (upperResult === '1' || upperResult === 'W') type = 'win';
      else if (upperResult === '2' || upperResult === 'L') type = 'loss';
      else type = 'draw'; // 'X' or 'D'
    } else {
      if (upperResult === '2' || upperResult === 'W') type = 'win';
      else if (upperResult === '1' || upperResult === 'L') type = 'loss';
      else type = 'draw'; // 'X' or 'D'
    }

    return {
      displayText,
      ...badgeStyles[type],
    };
  };

  // Ensure we always have 5 results (pad with empty if needed)
  const results = [...last5];
  while (results.length < 5) {
    results.push('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ultimi 5 risultati</Text>
      <View style={styles.badgesContainer}>
        {results.slice(0, 5).map((result, index) => {
          const badge = result ? getBadgeStyle(result) : { displayText: isHomeTeam ? '1' : '2', ...badgeStyles.draw };

          return (
            <View
              key={index}
              style={[
                styles.badge,
                {
                  backgroundColor: badge.backgroundColor,
                  borderColor: badge.borderColor,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: badge.textColor }]}>
                {badge.displayText}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const badgeStyles = {
  win: {
    backgroundColor: '#DCFCE7', // green-100
    textColor: '#166534',        // green-800
    borderColor: '#166534',
  },
  loss: {
    backgroundColor: '#FEE2E2', // red-100
    textColor: '#991B1B',        // red-800
    borderColor: '#991B1B',
  },
  draw: {
    backgroundColor: '#F3F4F6', // gray-100
    textColor: '#374151',        // gray-700
    borderColor: '#374151',
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    color: '#000000',
    marginBottom: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 10,
    textAlign: 'center',
  },
});
