import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EventLog } from '@domain/entities/EventLog';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';

interface Props {
  event: EventLog;
}

export const EventItem: React.FC<Props> = ({ event }) => {
  const { t } = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.type}>{event.type}</Text>
      <Text style={styles.message}>{event.message}</Text>
      <Text style={styles.date}>{new Date(event.createdAt).toLocaleString()}</Text>
    </View>
  );
};

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgSoft,
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
    },
    type: {
      color: c.accent,
      fontWeight: '700',
      marginBottom: 4,
    },
    message: {
      color: c.text,
      marginBottom: 4,
    },
    date: {
      color: c.textMuted,
      fontSize: 12,
    },
  });
