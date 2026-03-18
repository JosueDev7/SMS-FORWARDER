import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@domain/entities/Config';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { STORAGE_KEYS } from '@infrastructure/storage/keys';

const DEFAULT_CONFIG: Config = {
  telegramBotTokenBase64: '',
  telegramChatId: '',
  serviceEnabled: false,
};

export class ConfigStorageRepository implements ConfigRepository {
  async get(): Promise<Config> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      return DEFAULT_CONFIG;
    }
    return JSON.parse(raw) as Config;
  }

  async save(config: Config): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }
}
