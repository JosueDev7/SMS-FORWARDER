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
      const ts = Date.now();
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'DROPPED',
          message: 'Servicio desactivado. SMS ignorado.',
          smsId: sms.id,
          createdAt: ts,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'DROPPED',
          statusDetail: 'Servicio desactivado.',
          processedAt: ts,
        }),
      ]);
      return;
    }

    // Check schedule
    if (config.schedule?.enabled) {
      const now = new Date();
      const currentDay = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = config.schedule.startHour * 60 + config.schedule.startMinute;
      const endMinutes = config.schedule.endHour * 60 + config.schedule.endMinute;

      let inSchedule: boolean;
      if (startMinutes <= endMinutes) {
        inSchedule = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
        inSchedule = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }

      if (!config.schedule.daysOfWeek[currentDay] || !inSchedule) {
        logger.info(TAG, 'SMS fuera de horario programado, ignorado.');
        const ts = Date.now();
        await Promise.all([
          eventRepository.append({
            id: generateId(),
            type: 'DROPPED',
            message: 'Fuera de horario programado. SMS ignorado.',
            smsId: sms.id,
            createdAt: ts,
          }),
          messageRepository.append({
            id: sms.id,
            sender: sms.sender,
            body: sms.body,
            receivedAt: sms.receivedAt,
            status: 'DROPPED',
            statusDetail: 'Fuera de horario programado.',
            processedAt: ts,
          }),
        ]);
        return;
      }
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

    const enabledLinks = config.telegramLinks.filter((l) => l.enabled);
    if (enabledLinks.length === 0) {
      logger.error(TAG, 'No hay Telegram links activos configurados.');
      const now = Date.now();
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'ERROR',
          message: 'No hay Telegram links activos configurados.',
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'ERROR',
          statusDetail: 'No hay Telegram links activos.',
          processedAt: now,
        }),
      ]);
      return;
    }

    const text = `📩 Nuevo SMS\nDe: ${sms.sender}\nTexto: ${sms.body}`;
    let anySuccess = false;
    const errors: string[] = [];

    for (const link of enabledLinks) {
      const decodedToken = decodeBase64(link.botTokenBase64);
      if (!decodedToken || !link.chatId) {
        errors.push(`Link "${link.label}": token o chatId vacío.`);
        continue;
      }

      try {
        await telegramGateway.sendMessage({
          botToken: decodedToken,
          chatId: link.chatId,
          text,
        });
        logger.info(TAG, `SMS reenviado a "${link.label}" OK.`);
        anySuccess = true;
      } catch (error) {
        const msg = `Link "${link.label}": ${String(error)}`;
        logger.error(TAG, msg);
        errors.push(msg);
      }
    }

    const now = Date.now();
    if (anySuccess) {
      const detail = errors.length > 0 ? ` (${errors.length} fallido(s))` : '';
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'FORWARDED',
          message: `SMS reenviado a Telegram${detail}.`,
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'FORWARDED',
          statusDetail: errors.length > 0 ? errors.join('; ') : undefined,
          processedAt: now,
        }),
      ]);
    } else {
      await Promise.all([
        eventRepository.append({
          id: generateId(),
          type: 'ERROR',
          message: `Error reenviando SMS: ${errors.join('; ')}`,
          smsId: sms.id,
          createdAt: now,
        }),
        messageRepository.append({
          id: sms.id,
          sender: sms.sender,
          body: sms.body,
          receivedAt: sms.receivedAt,
          status: 'ERROR',
          statusDetail: errors.join('; '),
          processedAt: now,
        }),
      ]);
    }
  }
}
