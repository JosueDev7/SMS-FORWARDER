import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EventLog } from '@domain/entities/EventLog';
import { colors } from '@presentation/theme/colors';

interface Props {
  event: EventLog;
}

export const EventItem: React.FC<Props> = ({ event }) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.type}>{event.type}</Text>
      <Text style={styles.message}>{event.message}</Text>
      <Text style={styles.date}>{new Date(event.createdAt).toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  type: {
    color: colors.accent,
    fontWeight: '700',
    marginBottom: 4,
  },
  message: {
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
