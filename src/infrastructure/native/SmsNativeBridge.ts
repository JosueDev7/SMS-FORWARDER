import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

export interface NativeIncomingSmsEvent {
  sender: string;
  body: string;
  timestamp: number;
}

interface SmsForegroundModuleShape {
  startService(): Promise<void>;
  stopService(): Promise<void>;
}

const LINKING_ERROR =
  'SmsForegroundModule is unavailable. Make sure Android native module is linked in bare workflow.';

const smsModule: SmsForegroundModuleShape | null =
  Platform.OS === 'android'
    ? (NativeModules.SmsForegroundModule as SmsForegroundModuleShape | undefined) ?? null
    : null;

const emitter = smsModule ? new NativeEventEmitter(NativeModules.SmsForegroundModule) : null;

export const SmsNativeBridge = {
  async startService(): Promise<void> {
    if (!smsModule) {
      throw new Error(LINKING_ERROR);
    }
    await smsModule.startService();
  },

  async stopService(): Promise<void> {
    if (!smsModule) {
      throw new Error(LINKING_ERROR);
    }
    await smsModule.stopService();
  },

  subscribe(handler: (event: NativeIncomingSmsEvent) => void): (() => void) {
    if (!emitter) {
      return () => undefined;
    }

    const subscription = emitter.addListener('onIncomingSms', handler);
    return () => subscription.remove();
  },
};
