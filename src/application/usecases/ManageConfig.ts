import { Config } from '@domain/entities/Config';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { encodeBase64 } from '@shared/utils/base64';

export class ManageConfig {
  constructor(private readonly configRepository: ConfigRepository) {}

  get(): Promise<Config> {
    return this.configRepository.get();
  }

  async update(params: {
    telegramBotToken?: string;
    telegramChatId?: string;
    serviceEnabled?: boolean;
  }): Promise<Config> {
    const current = await this.configRepository.get();
    const updated: Config = {
      telegramBotTokenBase64: params.telegramBotToken
        ? encodeBase64(params.telegramBotToken)
        : current.telegramBotTokenBase64,
      telegramChatId: params.telegramChatId ?? current.telegramChatId,
      serviceEnabled: params.serviceEnabled ?? current.serviceEnabled,
    };

    await this.configRepository.save(updated);
    return updated;
  }
}
