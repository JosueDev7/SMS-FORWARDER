import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { logger } from '@shared/utils/logger';

const TAG = 'Permissions';

const REQUIRED_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
  PermissionsAndroid.PERMISSIONS.READ_SMS,
];

/**
 * Request all runtime permissions required for SMS interception.
 * Returns true if ALL permissions were granted.
 */
export async function requestSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    logger.warn(TAG, 'requestSmsPermissions called on non-Android platform.');
    return false;
  }

  try {
    // On Android 13+ also request POST_NOTIFICATIONS for the foreground service.
    const permsToRequest = [...REQUIRED_PERMISSIONS];
    if (Platform.Version >= 33) {
      permsToRequest.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    logger.info(TAG, `Solicitando permisos: ${permsToRequest.join(', ')}`);

    const results = await PermissionsAndroid.requestMultiple(permsToRequest);

    const allGranted = permsToRequest.every(
      (p) => results[p] === PermissionsAndroid.RESULTS.GRANTED,
    );

    if (allGranted) {
      logger.info(TAG, 'Todos los permisos concedidos.');
    } else {
      const denied = permsToRequest.filter(
        (p) => results[p] !== PermissionsAndroid.RESULTS.GRANTED,
      );
      logger.warn(TAG, `Permisos denegados: ${denied.join(', ')}`);

      const neverAskAgain = denied.some(
        (p) => results[p] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      );

      if (neverAskAgain) {
        Alert.alert(
          'Permisos necesarios',
          'Has denegado permisos de SMS permanentemente. Ve a Configuración de la app para habilitarlos manualmente.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configuración', onPress: () => void Linking.openSettings() },
          ],
        );
      }
    }

    return allGranted;
  } catch (err) {
    logger.error(TAG, `Error solicitando permisos: ${String(err)}`);
    return false;
  }
}

/**
 * Check (without requesting) if SMS permissions are already granted.
 */
export async function checkSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  const results = await Promise.all(
    REQUIRED_PERMISSIONS.map((p) => PermissionsAndroid.check(p)),
  );
  return results.every(Boolean);
}
