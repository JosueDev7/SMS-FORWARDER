import { TelegramGateway } from '@application/ports/TelegramGateway';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { EventRepository } from '@domain/repositories/EventRepository';
import { decodeBase64 } from '@shared/utils/base64';
import { generateId } from '@shared/utils/id';

export class SendTelegramTest {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly telegramGateway: TelegramGateway,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(): Promise<void> {
    const config = await this.configRepository.get();
    const decodedToken = decodeBase64(config.telegramBotTokenBase64);

    if (!decodedToken || !config.telegramChatId) {
      throw new Error('Config incompleta para Telegram.');
    }

    await this.telegramGateway.sendMessage({
      botToken: decodedToken,
      chatId: config.telegramChatId,
      text: 'SMS Forwarder MVP: conexion correcta.',
    });

    await this.eventRepository.append({
      id: generateId(),
      type: 'TEST',
      message: 'Test de conexion Telegram exitoso.',
      createdAt: Date.now(),
    });
  }
}
