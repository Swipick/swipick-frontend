import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { usersApi } from '../../services/api/users';
import { deveVerificareEmail } from '../../utils/verificaEmail';

/**
 * Promemoria per chi è entrato con la password senza aver verificato l'email.
 *
 * Non blocca: si gioca lo stesso. Serve a dare un modo per farsi rimandare il
 * link, che prima non c'era — il login avvisava con un popup e poi lasciava
 * entrare, senza più passare dalla schermata con "Reinvia".
 */
export default function AvvisoVerificaEmail() {
  const [visibile, setVisibile] = useState(false);
  const [azione, setAzione] = useState<null | 'reinvia' | 'controlla'>(null);
  const [messaggio, setMessaggio] = useState<string | null>(null);

  // Lo stato in memoria può essere vecchio: chi ha cliccato il link da un
  // altro dispositivo risulterebbe ancora da verificare.
  const aggiorna = async () => {
    const user = auth.currentUser;
    if (!user) return false;
    await user.reload().catch(() => undefined);
    const serve = deveVerificareEmail(auth.currentUser);
    setVisibile(serve);
    return serve;
  };

  useEffect(() => {
    aggiorna();
  }, []);

  const reinvia = async () => {
    const email = auth.currentUser?.email;
    if (!email || azione) return;
    setAzione('reinvia');
    try {
      await usersApi.resendVerificationEmail(email);
      setMessaggio(`Ti abbiamo mandato il link a ${email}. Guarda anche nello spam.`);
    } catch (error: any) {
      setMessaggio(error?.message ?? 'Non riesco a mandare la mail. Riprova tra poco.');
    } finally {
      setAzione(null);
    }
  };

  const controlla = async () => {
    if (azione) return;
    setAzione('controlla');
    try {
      const serve = await aggiorna();
      if (serve)
        setMessaggio('Non risulta ancora verificata: apri il link nella mail, poi riprova.');
    } finally {
      setAzione(null);
    }
  };

  if (!visibile) return null;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="mail-unread-outline" size={20} color="#92400e" />
        <Text style={styles.title}>Verifica la tua email</Text>
      </View>
      <Text style={styles.body}>
        Apri il link che ti abbiamo mandato: serve per entrare con email e password e per recuperare
        l'account se dimentichi la password.
      </Text>

      {messaggio && <Text style={styles.message}>{messaggio}</Text>}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primary} onPress={reinvia} disabled={azione !== null}>
          {azione === 'reinvia' ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryText}>Reinvia email</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={controlla} disabled={azione !== null}>
          {azione === 'controlla' ? (
            <ActivityIndicator color="#92400e" size="small" />
          ) : (
            <Text style={styles.secondaryText}>Ho verificato</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78350f',
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    color: '#92400e',
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  primary: {
    flex: 1,
    backgroundColor: '#d97706',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
});
