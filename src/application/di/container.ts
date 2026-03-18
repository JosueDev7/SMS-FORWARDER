import { ListRecentEvents } from '@application/usecases/ListRecentEvents';
import { ManageConfig } from '@application/usecases/ManageConfig';
import { ManageRules } from '@application/usecases/ManageRules';
import { ProcessIncomingSMS } from '@application/usecases/ProcessIncomingSMS';
import { SendTelegramTest } from '@application/usecases/SendTelegramTest';
import { TelegramApiClient } from '@infrastructure/api/TelegramApiClient';
import { EventStorageRepository } from '@infrastructure/storage/EventStorageRepository';
import { RuleStorageRepository } from '@infrastructure/storage/RuleStorageRepository';
import { ConfigStorageRepository } from '@infrastructure/storage/ConfigStorageRepository';

const ruleRepository = new RuleStorageRepository();
const configRepository = new ConfigStorageRepository();
const eventRepository = new EventStorageRepository();
const telegramGateway = new TelegramApiClient();

export const container = {
  usecases: {
    processIncomingSMS: new ProcessIncomingSMS({
      ruleRepository,
      configRepository,
      eventRepository,
      telegramGateway,
    }),
    manageRules: new ManageRules(ruleRepository),
    manageConfig: new ManageConfig(configRepository),
    listRecentEvents: new ListRecentEvents(eventRepository),
    sendTelegramTest: new SendTelegramTest(configRepository, telegramGateway, eventRepository),
  },
};
