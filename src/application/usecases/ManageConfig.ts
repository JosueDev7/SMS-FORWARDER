import { Config, TelegramLink, ScheduleConfig, createTelegramLink } from '@domain/entities/Config';
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
      telegramLinks: current.telegramLinks,
      serviceEnabled: params.serviceEnabled ?? current.serviceEnabled,
      schedule: current.schedule,
    };

    await this.configRepository.save(updated);
    return updated;
  }

  async updateSchedule(schedule: ScheduleConfig): Promise<Config> {
    const current = await this.configRepository.get();
    const updated: Config = { ...current, schedule };
    await this.configRepository.save(updated);
    return updated;
  }

  async addLink(input: { label: string; botToken: string; chatId: string }): Promise<Config> {
    const current = await this.configRepository.get();
    const link = createTelegramLink({
      label: input.label,
      botTokenBase64: encodeBase64(input.botToken),
      chatId: input.chatId,
    });
    const updated: Config = {
      ...current,
      telegramLinks: [...current.telegramLinks, link],
    };
    await this.configRepository.save(updated);
    return updated;
  }

  async updateLink(link: TelegramLink): Promise<Config> {
    const current = await this.configRepository.get();
    const updated: Config = {
      ...current,
      telegramLinks: current.telegramLinks.map((l) => (l.id === link.id ? link : l)),
    };
    await this.configRepository.save(updated);
    return updated;
  }

  async removeLink(id: string): Promise<Config> {
    const current = await this.configRepository.get();
    const updated: Config = {
      ...current,
      telegramLinks: current.telegramLinks.filter((l) => l.id !== id),
    };
    await this.configRepository.save(updated);
    return updated;
  }
}
