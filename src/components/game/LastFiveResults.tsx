import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FormEntry {
  fixtureId: string;
  code: string; // "1", "2", or "X"
  predicted: string | null;
  correct: boolean | null;
  wasHome: boolean;
}

interface LastFiveResultsProps {
  last5?: string[]; // Legacy format (will be deprecated)
  form?: FormEntry[]; // New format with full data
  isHomeTeam?: boolean; // Legacy prop for old format
}

/**
 * LastFiveResults - Shows 5 colored badges showing recent form
 *
 * Data Format (using form array):
 * - form[].code: Match result ("1"=home won, "2"=away won, "X"=draw)
 * - form[].wasHome: Boolean indicating if this team was home or away
 *
 * Display Logic:
 * - Number: "1" if team was home, "2" if team was away
 * - Color: Green if won, Red if lost, Gray if draw
 *
 * Examples for Como's last 5 games:
 * - wasHome=true, code="1" → Como HOME and WON → Green "1"
 * - wasHome=false, code="2" → Como AWAY and WON → Green "2"
 * - wasHome=true, code="X" → Como HOME and DREW → Gray "1"
 * - wasHome=false, code="1" → Como AWAY and LOST → Red "2"
 */
export function LastFiveResults({ last5, form, isHomeTeam }: LastFiveResultsProps) {
  const getBadgeFromForm = (entry: FormEntry) => {
    const position = entry.wasHome ? '1' : '2';
    const code = entry.code.toUpperCase();

    // Determine outcome from team's perspective
    let type: 'win' | 'loss' | 'draw' = 'draw';

    if (code === 'X') {
      type = 'draw';
    } else if (entry.wasHome) {
      // Team was home
      type = code === '1' ? 'win' : 'loss';
    } else {
      // Team was away
      type = code === '2' ? 'win' : 'loss';
    }

    return {
      displayText: position,
      ...badgeStyles[type],
    };
  };

  const getBadgeFromLegacy = (code: string) => {
    if (!code) {
      return {
        displayText: isHomeTeam ? '1' : '2',
        ...badgeStyles.draw,
      };
    }

    const upperCode = code.toUpperCase();
    const displayText = isHomeTeam ? '1' : '2';

    let type: 'win' | 'loss' | 'draw' = 'draw';

    if (upperCode === 'X' || upperCode === 'D') {
      type = 'draw';
    } else if (isHomeTeam) {
      type = upperCode === '1' || upperCode === 'W' ? 'win' : 'loss';
    } else {
      type = upperCode === '2' || upperCode === 'W' ? 'win' : 'loss';
    }

    return {
      displayText,
      ...badgeStyles[type],
    };
  };

  // Prefer form array over last5 (backward compatibility)
  let badges: Array<{ displayText: string; backgroundColor: string; textColor: string; borderColor: string }>;

  if (form && form.length > 0) {
    // Use new format
    badges = form.slice(0, 5).map(entry => getBadgeFromForm(entry));
  } else if (last5 && last5.length > 0) {
    // Use legacy format
    badges = last5.slice(0, 5).map(code => getBadgeFromLegacy(code));
  } else {
    badges = [];
  }

  // Ensure we always have 5 results (pad with empty if needed)
  while (badges.length < 5) {
    badges.push({
      displayText: '1',
      ...badgeStyles.draw,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ultimi 5 risultati</Text>
      <View style={styles.badgesContainer}>
        {badges.map((badge, index) => (
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
        ))}
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
