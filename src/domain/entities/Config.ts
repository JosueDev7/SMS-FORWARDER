import { generateId } from '@shared/utils/id';

export interface TelegramLink {
  id: string;
  label: string;
  botTokenBase64: string;
  chatId: string;
  enabled: boolean;
}

export interface Config {
  /** @deprecated Kept for migration from v1 single-link config. */
  telegramBotTokenBase64: string;
  /** @deprecated Kept for migration from v1 single-link config. */
  telegramChatId: string;
  telegramLinks: TelegramLink[];
  serviceEnabled: boolean;
}

export function createTelegramLink(partial: {
  label: string;
  botTokenBase64: string;
  chatId: string;
  enabled?: boolean;
}): TelegramLink {
  return {
    id: generateId(),
    label: partial.label,
    botTokenBase64: partial.botTokenBase64,
    chatId: partial.chatId,
    enabled: partial.enabled ?? true,
  };
}
