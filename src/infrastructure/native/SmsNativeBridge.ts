import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { logger } from '@shared/utils/logger';

const TAG = 'SmsNativeBridge';

export interface NativeIncomingSmsEvent {
  sender: string;
  body: string;
  timestamp: number;
}

interface SmsForegroundModuleShape {
  startService(): Promise<void>;
  stopService(): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const isWeb = Platform.OS === 'web';

const smsModule: SmsForegroundModuleShape | null =
  Platform.OS === 'android'
    ? (NativeModules.SmsForegroundModule as SmsForegroundModuleShape | undefined) ?? null
    : null;

if (smsModule) {
  logger.info(TAG, 'SmsForegroundModule vinculado correctamente.');
} else if (!isWeb) {
  logger.error(TAG, 'SmsForegroundModule NO encontrado en NativeModules. ¿Se registró el package?');
}

const emitter = smsModule ? new NativeEventEmitter(NativeModules.SmsForegroundModule) : null;

export const SmsNativeBridge = {
  async startService(): Promise<void> {
    if (!smsModule) {
      if (!isWeb) {
        const msg = 'SmsForegroundModule no disponible. Asegúrate de compilar en bare workflow.';
        logger.error(TAG, msg);
        throw new Error(msg);
      }
      return;
    }
    logger.info(TAG, 'startService() llamado.');
    await smsModule.startService();
    logger.info(TAG, 'startService() completado.');
  },

  async stopService(): Promise<void> {
    if (!smsModule) {
      if (!isWeb) {
        const msg = 'SmsForegroundModule no disponible.';
        logger.error(TAG, msg);
        throw new Error(msg);
      }
      return;
    }
    logger.info(TAG, 'stopService() llamado.');
    await smsModule.stopService();
    logger.info(TAG, 'stopService() completado.');
  },

  subscribe(handler: (event: NativeIncomingSmsEvent) => void): (() => void) {
    if (!emitter) {
      logger.warn(TAG, 'subscribe() sin emitter — no se puede escuchar SMS.');
      return () => undefined;
    }

    logger.info(TAG, 'Suscrito a evento "onIncomingSms".');
    const subscription = emitter.addListener('onIncomingSms', (event: NativeIncomingSmsEvent) => {
      logger.info(TAG, `onIncomingSms recibido → sender=${event.sender}, bodyLen=${event.body?.length ?? 0}`);
      handler(event);
    });
    return () => {
      logger.info(TAG, 'Listener "onIncomingSms" removido.');
      subscription.remove();
    };
  },
};
