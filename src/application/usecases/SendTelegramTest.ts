import { TelegramGateway } from '@application/ports/TelegramGateway';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { EventRepository } from '@domain/repositories/EventRepository';
import { decodeBase64 } from '@shared/utils/base64';
import { generateId } from '@shared/utils/id';
import { logger } from '@shared/utils/logger';

const TAG = 'SendTelegramTest';

export class SendTelegramTest {
  constructor(
    private readonly configRepository: ConfigRepository,
    private readonly telegramGateway: TelegramGateway,
    private readonly eventRepository: EventRepository,
  ) {}

  /** Test a specific link by id */
  async executeForLink(linkId: string): Promise<void> {
    const config = await this.configRepository.get();
    const link = config.telegramLinks.find((l) => l.id === linkId);
    if (!link) throw new Error('Telegram Link no encontrado.');

    const decodedToken = decodeBase64(link.botTokenBase64);
    if (!decodedToken || !link.chatId) {
      throw new Error(`Config incompleta para "${link.label}".`);
    }

    logger.info(TAG, `Test → "${link.label}" chatId=${link.chatId}`);
    await this.telegramGateway.sendMessage({
      botToken: decodedToken,
      chatId: link.chatId,
      text: `✅ SMS Forwarder: conexión correcta con "${link.label}".`,
    });

    await this.eventRepository.append({
      id: generateId(),
      type: 'TEST',
      message: `Test de conexión OK para "${link.label}".`,
      createdAt: Date.now(),
    });
  }

  /** Test ALL enabled links */
  async execute(): Promise<void> {
    const config = await this.configRepository.get();
    const enabledLinks = config.telegramLinks.filter((l) => l.enabled);

    if (enabledLinks.length === 0) {
      throw new Error('No hay Telegram Links activos configurados.');
    }

    const errors: string[] = [];
    for (const link of enabledLinks) {
      try {
        await this.executeForLink(link.id);
      } catch (err) {
        errors.push(`"${link.label}": ${String(err)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errores en test: ${errors.join('; ')}`);
    }
  }
}
