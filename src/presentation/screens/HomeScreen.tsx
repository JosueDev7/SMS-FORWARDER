import React from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppStore } from '@presentation/context/appStore';
import { EventItem } from '@presentation/components/EventItem';
import { globalStyles } from '@presentation/theme/globalStyles';
import { colors } from '@presentation/theme/colors';

export const HomeScreen: React.FC = () => {
  const events = useAppStore((state) => state.events);
  const serviceEnabled = useAppStore((state) => state.serviceEnabled);
  const nativeLinked = useAppStore((state) => state.nativeLinked);
  const toggleService = useAppStore((state) => state.toggleService);

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>EVENT FEED</Text>
      <Text style={globalStyles.subtitle}>Ultimos 50 eventos del servicio</Text>

      <View style={[globalStyles.card, styles.switchRow]}>
        <View>
          <Text style={styles.switchLabel}>Servicio de Intercepcion</Text>
          <Text style={styles.switchHint}>{serviceEnabled ? 'Activo' : 'Inactivo'}</Text>
          {!nativeLinked ? <Text style={styles.warning}>Modulo nativo no vinculado.</Text> : null}
        </View>
        <Switch
          value={serviceEnabled}
          onValueChange={(value) => {
            void toggleService(value);
          }}
          trackColor={{ false: '#31425A', true: colors.accentSoft }}
          thumbColor={serviceEnabled ? colors.accent : '#A4B6D4'}
        />
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventItem event={item} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  switchLabel: {
    color: colors.text,
    fontWeight: '700',
  },
  switchHint: {
    color: colors.textMuted,
    marginTop: 4,
  },
  warning: {
    color: colors.danger,
    marginTop: 4,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 32,
  },
});
