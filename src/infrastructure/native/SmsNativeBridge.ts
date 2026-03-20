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

const isWeb = Platform.OS === 'web';

const LINKING_ERROR = isWeb
  ? 'SMS interception unavailable on web. Use Android app for native SMS features.'
  : 'SmsForegroundModule is unavailable. Make sure Android native module is linked in bare workflow.';

const smsModule: SmsForegroundModuleShape | null =
  Platform.OS === 'android'
    ? (NativeModules.SmsForegroundModule as SmsForegroundModuleShape | undefined) ?? null
    : null;

const emitter = smsModule ? new NativeEventEmitter(NativeModules.SmsForegroundModule) : null;

export const SmsNativeBridge = {
  async startService(): Promise<void> {
    if (!smsModule) {
      if (!isWeb) {
        throw new Error(LINKING_ERROR);
      }
      return;
    }
    await smsModule.startService();
  },

  async stopService(): Promise<void> {
    if (!smsModule) {
      if (!isWeb) {
        throw new Error(LINKING_ERROR);
      }
      return;
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
