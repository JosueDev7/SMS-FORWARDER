import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppStore } from '@presentation/context/appStore';
import { EventItem } from '@presentation/components/EventItem';
import { globalStyles } from '@presentation/theme/globalStyles';
import { colors } from '@presentation/theme/colors';
import { checkSmsPermissions, requestSmsPermissions } from '@infrastructure/native/permissions';

export const HomeScreen: React.FC = () => {
  const events = useAppStore((state) => state.events);
  const serviceEnabled = useAppStore((state) => state.serviceEnabled);
  const nativeLinked = useAppStore((state) => state.nativeLinked);
  const toggleService = useAppStore((state) => state.toggleService);

  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    void checkSmsPermissions().then(setPermissionsGranted);
  }, []);

  const handleRequestPermissions = useCallback(async () => {
    const granted = await requestSmsPermissions();
    setPermissionsGranted(granted);
    if (!granted) {
      Alert.alert('Permisos', 'No se pudieron obtener todos los permisos necesarios.');
    }
  }, []);

  const handleToggle = useCallback(
    async (value: boolean) => {
      if (value && permissionsGranted === false) {
        const granted = await requestSmsPermissions();
        setPermissionsGranted(granted);
        if (!granted) {
          Alert.alert('Permisos', 'Necesitas otorgar permisos de SMS para activar el servicio.');
          return;
        }
      }
      await toggleService(value);
    },
    [permissionsGranted, toggleService],
  );

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>EVENT FEED</Text>
      <Text style={globalStyles.subtitle}>Ultimos 50 eventos del servicio</Text>

      {/* Permission warning */}
      {permissionsGranted === false && (
        <Pressable style={styles.permissionBanner} onPress={() => void handleRequestPermissions()}>
          <Text style={styles.permissionText}>
            ⚠ Permisos de SMS no concedidos. Toca aquí para solicitarlos.
          </Text>
        </Pressable>
      )}

      <View style={[globalStyles.card, styles.switchRow]}>
        <View>
          <Text style={styles.switchLabel}>Servicio de Intercepcion</Text>
          <Text style={styles.switchHint}>{serviceEnabled ? 'Activo' : 'Inactivo'}</Text>
          {!nativeLinked ? <Text style={styles.warning}>Modulo nativo no vinculado.</Text> : null}
        </View>
        <Switch
          value={serviceEnabled}
          onValueChange={(value) => {
            void handleToggle(value);
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
  permissionBanner: {
    backgroundColor: '#3A2000',
    borderColor: '#F5A623',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  permissionText: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
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
