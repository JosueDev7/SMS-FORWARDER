import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { EventRepository } from '@domain/repositories/EventRepository';
import { RuleRepository } from '@domain/repositories/RuleRepository';
import { SMS } from '@domain/entities/SMS';
import { TelegramGateway } from '@application/ports/TelegramGateway';
import { decodeBase64 } from '@shared/utils/base64';
import { generateId } from '@shared/utils/id';

interface Dependencies {
  ruleRepository: RuleRepository;
  configRepository: ConfigRepository;
  eventRepository: EventRepository;
  telegramGateway: TelegramGateway;
}

export class ProcessIncomingSMS {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(sms: SMS): Promise<void> {
    const { ruleRepository, configRepository, eventRepository, telegramGateway } = this.dependencies;

    await eventRepository.append({
      id: generateId(),
      type: 'RECEIVED',
      message: `SMS recibido de ${sms.sender}`,
      smsId: sms.id,
      createdAt: Date.now(),
    });

    const config = await configRepository.get();
    if (!config.serviceEnabled) {
      await eventRepository.append({
        id: generateId(),
        type: 'DROPPED',
        message: 'Servicio desactivado. SMS ignorado.',
        smsId: sms.id,
        createdAt: Date.now(),
      });
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
      await eventRepository.append({
        id: generateId(),
        type: 'DROPPED',
        message: 'SMS no coincide con ninguna regla activa.',
        smsId: sms.id,
        createdAt: Date.now(),
      });
      return;
    }

    const decodedToken = decodeBase64(config.telegramBotTokenBase64);
    if (!decodedToken || !config.telegramChatId) {
      await eventRepository.append({
        id: generateId(),
        type: 'ERROR',
        message: 'Token o chatId no configurados.',
        smsId: sms.id,
        createdAt: Date.now(),
      });
      return;
    }

    try {
      await telegramGateway.sendMessage({
        botToken: decodedToken,
        chatId: config.telegramChatId,
        text: `Nuevo SMS\nDe: ${sms.sender}\nTexto: ${sms.body}`,
      });

      await eventRepository.append({
        id: generateId(),
        type: 'FORWARDED',
        message: 'SMS reenviado a Telegram.',
        smsId: sms.id,
        createdAt: Date.now(),
      });
    } catch (error) {
      await eventRepository.append({
        id: generateId(),
        type: 'ERROR',
        message: `Error reenviando SMS: ${String(error)}`,
        smsId: sms.id,
        createdAt: Date.now(),
      });
    }
  }
}
