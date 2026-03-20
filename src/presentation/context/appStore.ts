import { container } from '@application/di/container';
import { Rule } from '@domain/entities/Rule';
import { EventLog } from '@domain/entities/EventLog';
import { InterceptedMessage } from '@domain/entities/InterceptedMessage';
import { TelegramLink } from '@domain/entities/Config';
import { SMS } from '@domain/entities/SMS';
import { SmsNativeBridge } from '@infrastructure/native/SmsNativeBridge';
import { generateId } from '@shared/utils/id';
import { logger } from '@shared/utils/logger';
import { create } from 'zustand';

const TAG = 'AppStore';

interface AppState {
  rules: Rule[];
  events: EventLog[];
  messages: InterceptedMessage[];
  telegramLinks: TelegramLink[];
  serviceEnabled: boolean;
  loading: boolean;
  nativeLinked: boolean;
  init: () => Promise<void>;
  bindSmsListener: () => () => void;
  toggleService: (enabled: boolean) => Promise<void>;
  addTelegramLink: (input: { label: string; botToken: string; chatId: string }) => Promise<void>;
  updateTelegramLink: (link: TelegramLink) => Promise<void>;
  removeTelegramLink: (id: string) => Promise<void>;
  testLink: (linkId: string) => Promise<void>;
  testAllLinks: () => Promise<void>;
  createRule: (input: Omit<Rule, 'id'>) => Promise<void>;
  updateRule: (rule: Rule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  clearMessages: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  rules: [],
  events: [],
  messages: [],
  telegramLinks: [],
  serviceEnabled: false,
  loading: false,
  nativeLinked: true,

  init: async () => {
    logger.info(TAG, 'Inicializando store...');
    set({ loading: true });
    const [rules, config, events, messages] = await Promise.all([
      container.usecases.manageRules.list(),
      container.usecases.manageConfig.get(),
      container.usecases.listRecentEvents.execute(50),
      container.usecases.listInterceptedMessages.execute(100),
    ]);

    set({
      rules,
      telegramLinks: config.telegramLinks,
      serviceEnabled: config.serviceEnabled,
      events,
      messages,
      loading: false,
    });
    logger.info(TAG, `Store init OK. ${rules.length} regla(s), ${config.telegramLinks.length} link(s), serviceEnabled=${String(config.serviceEnabled)}`);
  },

  bindSmsListener: () => {
    logger.info(TAG, 'Listener SMS vinculado.');
    const unsubscribe = SmsNativeBridge.subscribe(async (nativeSms) => {
      logger.info(TAG, `SMS nativo recibido de ${nativeSms.sender}`);
      const sms: SMS = {
        id: generateId(),
        sender: nativeSms.sender,
        body: nativeSms.body,
        receivedAt: nativeSms.timestamp,
      };
      await container.usecases.processIncomingSMS.execute(sms);
      await Promise.all([get().refreshEvents(), get().refreshMessages()]);
    });
    return unsubscribe;
  },

  toggleService: async (enabled: boolean) => {
    logger.info(TAG, `toggleService → ${enabled ? 'ACTIVAR' : 'DESACTIVAR'}`);
    await container.usecases.manageConfig.update({ serviceEnabled: enabled });

    try {
      if (enabled) {
        await SmsNativeBridge.startService();
        logger.info(TAG, 'Servicio nativo iniciado.');
      } else {
        await SmsNativeBridge.stopService();
        logger.info(TAG, 'Servicio nativo detenido.');
      }
      set({ nativeLinked: true });
    } catch (err) {
      logger.error(TAG, `Error al ${enabled ? 'iniciar' : 'detener'} servicio nativo: ${String(err)}`);
      set({ nativeLinked: false });
    }

    set({ serviceEnabled: enabled });
    await Promise.all([get().refreshEvents(), get().refreshMessages()]);
  },

  addTelegramLink: async (input) => {
    logger.info(TAG, `addTelegramLink → "${input.label}"`);
    const config = await container.usecases.manageConfig.addLink(input);
    set({ telegramLinks: config.telegramLinks });
  },

  updateTelegramLink: async (link) => {
    logger.info(TAG, `updateTelegramLink → "${link.label}" (${link.id})`);
    const config = await container.usecases.manageConfig.updateLink(link);
    set({ telegramLinks: config.telegramLinks });
  },

  removeTelegramLink: async (id) => {
    logger.info(TAG, `removeTelegramLink → ${id}`);
    const config = await container.usecases.manageConfig.removeLink(id);
    set({ telegramLinks: config.telegramLinks });
  },

  testLink: async (linkId) => {
    logger.info(TAG, `testLink → ${linkId}`);
    await container.usecases.sendTelegramTest.executeForLink(linkId);
    await get().refreshEvents();
  },

  testAllLinks: async () => {
    logger.info(TAG, 'testAllLinks');
    await container.usecases.sendTelegramTest.execute();
    await get().refreshEvents();
  },

  createRule: async (input) => {
    logger.info(TAG, `createRule → "${input.name}" pattern="${input.pattern}"`);
    await container.usecases.manageRules.create(input);
    const rules = await container.usecases.manageRules.list();
    set({ rules });
  },

  updateRule: async (rule) => {
    await container.usecases.manageRules.update(rule);
    const rules = await container.usecases.manageRules.list();
    set({ rules });
  },

  deleteRule: async (id) => {
    logger.info(TAG, `deleteRule → id=${id}`);
    await container.usecases.manageRules.remove(id);
    const rules = await container.usecases.manageRules.list();
    set({ rules });
  },

  refreshEvents: async () => {
    const events = await container.usecases.listRecentEvents.execute(50);
    set({ events });
  },

  refreshMessages: async () => {
    const messages = await container.usecases.listInterceptedMessages.execute(100);
    set({ messages });
  },

  clearMessages: async () => {
    await container.repositories.messageRepository.clear();
    set({ messages: [] });
  },
}));
