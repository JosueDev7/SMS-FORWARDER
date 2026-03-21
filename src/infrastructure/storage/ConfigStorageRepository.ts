import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config, DEFAULT_SCHEDULE } from '@domain/entities/Config';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { STORAGE_KEYS } from '@infrastructure/storage/keys';

const DEFAULT_CONFIG: Config = {
  telegramBotTokenBase64: '',
  telegramChatId: '',
  telegramLinks: [],
  serviceEnabled: false,
  schedule: DEFAULT_SCHEDULE,
};

export class ConfigStorageRepository implements ConfigRepository {
  async get(): Promise<Config> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw) as Partial<Config>;

    // Migration: if old config has no telegramLinks, create one from legacy fields.
    if (!parsed.telegramLinks) {
      const links =
        parsed.telegramBotTokenBase64 && parsed.telegramChatId
          ? [
              {
                id: 'migrated-1',
                label: 'Principal',
                botTokenBase64: parsed.telegramBotTokenBase64,
                chatId: parsed.telegramChatId,
                enabled: true,
              },
            ]
          : [];
      return {
        telegramBotTokenBase64: parsed.telegramBotTokenBase64 ?? '',
        telegramChatId: parsed.telegramChatId ?? '',
        telegramLinks: links,
        serviceEnabled: parsed.serviceEnabled ?? false,
        schedule: parsed.schedule ?? DEFAULT_SCHEDULE,
      };
    }

    return {
      telegramBotTokenBase64: parsed.telegramBotTokenBase64 ?? '',
      telegramChatId: parsed.telegramChatId ?? '',
      telegramLinks: parsed.telegramLinks,
      serviceEnabled: parsed.serviceEnabled ?? false,
      schedule: parsed.schedule ?? DEFAULT_SCHEDULE,
    };
  }

  async save(config: Config): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }
}
