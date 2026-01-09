import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatKickoffTime } from '../../utils/formatters';

interface MatchDetailsProps {
  kickoff?: {
    iso: string;
    display: string;
  };
  stadium?: string;
  date?: string;
  venue?: string;
}

export function MatchDetails({ kickoff, stadium, date, venue }: MatchDetailsProps) {
  // Use kickoff.display if available, otherwise format ISO date, fallback to provided date
  const displayDate = kickoff?.display || (kickoff?.iso ? formatKickoffTime(kickoff.iso) : date || '');
  const displayStadium = stadium || venue || '';

  return (
    <View style={styles.container}>
      {displayDate && (
        <Text style={styles.dateText}>{displayDate}</Text>
      )}
      {displayStadium && (
        <Text style={styles.stadiumText}>{displayStadium}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  stadiumText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.75)',
    textAlign: 'center',
  },
});
