import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatKickoffTime } from '../../utils/formatters';
import i18n from '../../i18n';

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
  // Il `display` arriva dal server già scritto in italiano ("sab 21/11 – 15:00"):
  // in inglese si riformatta dall'istante, sempre in ora italiana.
  const daServer = i18n.language === 'it' ? kickoff?.display : undefined;
  const displayDate =
    daServer || (kickoff?.iso ? formatKickoffTime(kickoff.iso) : kickoff?.display || date || '');
  const displayStadium = stadium || venue || '';

  return (
    <View style={styles.container}>
      {displayDate && <Text style={styles.dateText}>{displayDate}</Text>}
      {displayStadium && <Text style={styles.stadiumText}>{displayStadium}</Text>}
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
