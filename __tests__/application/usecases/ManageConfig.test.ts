import { ManageConfig } from '@application/usecases/ManageConfig';
import { Config, DEFAULT_SCHEDULE } from '@domain/entities/Config';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { decodeBase64 } from '@shared/utils/base64';

class InMemoryConfigRepository implements ConfigRepository {
  constructor(private config: Config) {}
  get(): Promise<Config> {
    return Promise.resolve(this.config);
  }
  save(config: Config): Promise<void> {
    this.config = config;
    return Promise.resolve();
  }
}

describe('ManageConfig', () => {
  it('stores telegram token encoded in base64', async () => {
    const repository = new InMemoryConfigRepository({
      telegramBotTokenBase64: '',
      telegramChatId: '',
      telegramLinks: [],
      serviceEnabled: false,
      schedule: DEFAULT_SCHEDULE,
    });

    const usecase = new ManageConfig(repository);
    const updated = await usecase.update({
      telegramBotToken: 'my-token',
      telegramChatId: '1000',
      serviceEnabled: true,
    });

    expect(updated.telegramBotTokenBase64).not.toBe('my-token');
    expect(decodeBase64(updated.telegramBotTokenBase64)).toBe('my-token');
    expect(updated.telegramChatId).toBe('1000');
    expect(updated.serviceEnabled).toBe(true);
  });

  it('keeps existing token when new token is omitted', async () => {
    const repository = new InMemoryConfigRepository({
      telegramBotTokenBase64: 'ZXhpc3RpbmctdG9rZW4=',
      telegramChatId: 'old',
      telegramLinks: [],
      serviceEnabled: false,
      schedule: DEFAULT_SCHEDULE,
    });

    const usecase = new ManageConfig(repository);
    const updated = await usecase.update({
      telegramChatId: 'new-chat',
    });

    expect(updated.telegramBotTokenBase64).toBe('ZXhpc3RpbmctdG9rZW4=');
    expect(updated.telegramChatId).toBe('new-chat');
  });
});
