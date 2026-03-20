import { container } from '@application/di/container';
import { Rule } from '@domain/entities/Rule';
import { EventLog } from '@domain/entities/EventLog';
import { SMS } from '@domain/entities/SMS';
import { SmsNativeBridge } from '@infrastructure/native/SmsNativeBridge';
import { generateId } from '@shared/utils/id';
import { create } from 'zustand';

interface AppState {
  rules: Rule[];
  events: EventLog[];
  telegramBotToken: string;
  telegramChatId: string;
  serviceEnabled: boolean;
  loading: boolean;
  nativeLinked: boolean;
  init: () => Promise<void>;
  bindSmsListener: () => () => void;
  toggleService: (enabled: boolean) => Promise<void>;
  saveSettings: (params: { token: string; chatId: string }) => Promise<void>;
  testConnection: () => Promise<void>;
  createRule: (input: Omit<Rule, 'id'>) => Promise<void>;
  updateRule: (rule: Rule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  rules: [],
  events: [],
  telegramBotToken: '',
  telegramChatId: '',
  serviceEnabled: false,
  loading: false,
  nativeLinked: true,

  init: async () => {
    set({ loading: true });
    const [rules, config, events] = await Promise.all([
      container.usecases.manageRules.list(),
      container.usecases.manageConfig.get(),
      container.usecases.listRecentEvents.execute(50),
    ]);

    set({
      rules,
      telegramChatId: config.telegramChatId,
      serviceEnabled: config.serviceEnabled,
      events,
      loading: false,
    });
  },

  bindSmsListener: () => {
    const unsubscribe = SmsNativeBridge.subscribe(async (nativeSms) => {
      const sms: SMS = {
        id: generateId(),
        sender: nativeSms.sender,
        body: nativeSms.body,
        receivedAt: nativeSms.timestamp,
      };
      await container.usecases.processIncomingSMS.execute(sms);
      await get().refreshEvents();
    });
    return unsubscribe;
  },

  toggleService: async (enabled: boolean) => {
    await container.usecases.manageConfig.update({ serviceEnabled: enabled });

    try {
      if (enabled) {
        await SmsNativeBridge.startService();
      } else {
        await SmsNativeBridge.stopService();
      }
      set({ nativeLinked: true });
    } catch {
      set({ nativeLinked: false });
    }

    set({ serviceEnabled: enabled });
    await get().refreshEvents();
  },

  saveSettings: async ({ token, chatId }) => {
    await container.usecases.manageConfig.update({
      telegramBotToken: token,
      telegramChatId: chatId,
    });

    set({
      telegramBotToken: token,
      telegramChatId: chatId,
    });
  },

  testConnection: async () => {
    try {
      await container.usecases.sendTelegramTest.execute();
      await get().refreshEvents();
    } catch (error) {
      await get().refreshEvents();
      throw error;
    }
  },

  createRule: async (input) => {
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
    await container.usecases.manageRules.remove(id);
    const rules = await container.usecases.manageRules.list();
    set({ rules });
  },

  refreshEvents: async () => {
    const events = await container.usecases.listRecentEvents.execute(50);
    set({ events });
  },
}));
