import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { EventRepository } from '@domain/repositories/EventRepository';
import { MessageRepository } from '@domain/repositories/MessageRepository';
import { RuleRepository } from '@domain/repositories/RuleRepository';
import { SMS } from '@domain/entities/SMS';
import { TelegramGateway } from '@application/ports/TelegramGateway';
import { decodeBase64 } from '@shared/utils/base64';
import { generateId } from '@shared/utils/id';
import { logger } from '@shared/utils/logger';

const TAG = 'ProcessSMS';

interface Dependencies {
  ruleRepository: RuleRepository;
  configRepository: ConfigRepository;
  eventRepository: EventRepository;
  messageRepository: MessageRepository;
  telegramGateway: TelegramGateway;
}

export class ProcessIncomingSMS {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(sms: SMS): Promise<void> {
    const { ruleRepository, configRepository, eventRepository, messageRepository, telegramGateway } =
      this.dependencies;

    logger.info(TAG, `SMS recibido de ${sms.sender} (id=${sms.id})`);

    await eventRepository.append({
      id: generateId(),
      type: 'RECEIVED',
      message: `SMS recibido de ${sms.sender}`,
      smsId: sms.id,
      createdAt: Date.now(),
    });

    const config = await configRepository.get();
    if (!config.serviceEnabled) {
      logger.warn(TAG, 'Servicio desactivado, SMS ignorado.');
      const now = Date.now();
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'DROPPED',
          message: 'Servicio desactivado. SMS ignorado.',
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'DROPPED',
          statusDetail: 'Servicio desactivado.',
          processedAt: now,
        }),
      ]);
      return;
    }

    const enabledRules = (await ruleRepository.list()).filter((rule) => rule.enabled);
    const matched = enabledRules.some((rule) => {
      if (rule.useRegex) {
        try {
          return new RegExp(rule.pattern, 'i').test(sms.body);
        } catch {
          return false;
        }
      }
      return sms.body.toLowerCase().includes(rule.pattern.toLowerCase());
    });

    if (!matched) {
      logger.info(TAG, `SMS de ${sms.sender} no coincide con ninguna regla activa.`);
      const now = Date.now();
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'DROPPED',
          message: 'SMS no coincide con ninguna regla activa.',
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'DROPPED',
          statusDetail: 'Sin regla coincidente.',
          processedAt: now,
        }),
      ]);
      return;
    }

    logger.info(TAG, `SMS de ${sms.sender} coincide con regla. Reenviando a Telegram...`);

    const decodedToken = decodeBase64(config.telegramBotTokenBase64);
    if (!decodedToken || !config.telegramChatId) {
      logger.error(TAG, 'Token o chatId no configurados.');
      const now = Date.now();
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'ERROR',
          message: 'Token o chatId no configurados.',
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'ERROR',
          statusDetail: 'Token o chatId no configurados.',
          processedAt: now,
        }),
      ]);
      return;
    }

    try {
      await telegramGateway.sendMessage({
        botToken: decodedToken,
        chatId: config.telegramChatId,
        text: `Nuevo SMS\nDe: ${sms.sender}\nTexto: ${sms.body}`,
      });

      logger.info(TAG, `SMS reenviado a Telegram exitosamente.`);
      const now = Date.now();
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'FORWARDED',
          message: 'SMS reenviado a Telegram.',
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'FORWARDED',
          processedAt: now,
        }),
      ]);
    } catch (error) {
      logger.error(TAG, `Error reenviando SMS: ${String(error)}`);
      const now = Date.now();
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'ERROR',
          message: `Error reenviando SMS: ${String(error)}`,
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'ERROR',
          statusDetail: String(error),
          processedAt: now,
        }),
      ]);
    }
  }
}
