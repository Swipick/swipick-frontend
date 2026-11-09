import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

/**
 * Fa posto alla tastiera su Android.
 *
 * Su iOS le ScrollView dei moduli si spostano da sole con
 * `automaticallyAdjustKeyboardInsets`, che su Android non esiste: lì la
 * tastiera copre campi e pulsanti in basso e non lascia scorrere fino a loro.
 * Su Android la schermata si accorcia di quanto è alta la tastiera; su iOS non
 * aggiunge nulla.
 */
export default function SpazioTastiera({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'android') return <>{children}</>;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
