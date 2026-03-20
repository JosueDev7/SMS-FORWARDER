import { ListRecentEvents } from '@application/usecases/ListRecentEvents';
import { ListInterceptedMessages } from '@application/usecases/ListInterceptedMessages';
import { ManageConfig } from '@application/usecases/ManageConfig';
import { ManageRules } from '@application/usecases/ManageRules';
import { ProcessIncomingSMS } from '@application/usecases/ProcessIncomingSMS';
import { SendTelegramTest } from '@application/usecases/SendTelegramTest';
import { TelegramApiClient } from '@infrastructure/api/TelegramApiClient';
import { EventStorageRepository } from '@infrastructure/storage/EventStorageRepository';
import { RuleStorageRepository } from '@infrastructure/storage/RuleStorageRepository';
import { ConfigStorageRepository } from '@infrastructure/storage/ConfigStorageRepository';
import { MessageStorageRepository } from '@infrastructure/storage/MessageStorageRepository';

const ruleRepository = new RuleStorageRepository();
const configRepository = new ConfigStorageRepository();
const eventRepository = new EventStorageRepository();
const messageRepository = new MessageStorageRepository();
const telegramGateway = new TelegramApiClient();

export const container = {
  repositories: {
    messageRepository,
  },
  usecases: {
    processIncomingSMS: new ProcessIncomingSMS({
      ruleRepository,
      configRepository,
      eventRepository,
      messageRepository,
      telegramGateway,
    }),
    manageRules: new ManageRules(ruleRepository),
    manageConfig: new ManageConfig(configRepository),
    listRecentEvents: new ListRecentEvents(eventRepository),
    listInterceptedMessages: new ListInterceptedMessages(messageRepository),
    sendTelegramTest: new SendTelegramTest(configRepository, telegramGateway, eventRepository),
  },
};
