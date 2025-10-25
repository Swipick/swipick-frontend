import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CountdownTimerProps {
  targetDate: Date | string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatUnit = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{formatUnit(timeLeft.days)}</Text>
        <Text style={styles.timeLabel}>giorni</Text>
      </View>
      <Text style={styles.separator}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{formatUnit(timeLeft.hours)}</Text>
        <Text style={styles.timeLabel}>ore</Text>
      </View>
      <Text style={styles.separator}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{formatUnit(timeLeft.minutes)}</Text>
        <Text style={styles.timeLabel}>min</Text>
      </View>
      <Text style={styles.separator}>:</Text>
      <View style={styles.timeUnit}>
        <Text style={styles.timeValue}>{formatUnit(timeLeft.seconds)}</Text>
        <Text style={styles.timeLabel}>sec</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  timeLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  separator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 2,
  },
});
