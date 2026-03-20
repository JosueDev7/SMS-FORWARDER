import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppStore } from '@presentation/context/appStore';
import { EventItem } from '@presentation/components/EventItem';
import { useGlobalStyles } from '@presentation/theme/globalStyles';
import { useTheme } from '@presentation/theme/ThemeContext';
import { ThemeColors } from '@presentation/theme/colors';
import { checkSmsPermissions, requestSmsPermissions } from '@infrastructure/native/permissions';

export const HomeScreen: React.FC = () => {
  const { t } = useTheme();
  const gs = useGlobalStyles();
  const styles = useMemo(() => createStyles(t), [t]);

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
    <View style={gs.screen}>
      <Text style={gs.title}>EVENT FEED</Text>
      <Text style={gs.subtitle}>Ultimos 50 eventos del servicio</Text>

      {/* Permission warning */}
      {permissionsGranted === false && (
        <Pressable style={styles.permissionBanner} onPress={() => void handleRequestPermissions()}>
          <Text style={styles.permissionText}>
            ⚠ Permisos de SMS no concedidos. Toca aquí para solicitarlos.
          </Text>
        </Pressable>
      )}

      <View style={[gs.card, styles.switchRow]}>
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
          trackColor={{ false: t.switchTrackOff, true: t.accentSoft }}
          thumbColor={serviceEnabled ? t.accent : t.switchThumbOff}
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

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    permissionBanner: {
      backgroundColor: c.warning + '20',
      borderColor: c.warning,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      marginTop: 10,
    },
    permissionText: {
      color: c.warning,
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
      color: c.text,
      fontWeight: '700',
    },
    switchHint: {
      color: c.textMuted,
      marginTop: 4,
    },
    warning: {
      color: c.danger,
      marginTop: 4,
    },
    listContent: {
      paddingTop: 12,
      paddingBottom: 32,
    },
  });
