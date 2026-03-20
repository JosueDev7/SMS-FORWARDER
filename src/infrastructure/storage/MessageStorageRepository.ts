import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterceptedMessage } from '@domain/entities/InterceptedMessage';
import { MessageRepository } from '@domain/repositories/MessageRepository';
import { STORAGE_KEYS } from '@infrastructure/storage/keys';

const MAX_STORED = 200;

export class MessageStorageRepository implements MessageRepository {
  async list(limit = 100): Promise<InterceptedMessage[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    const all = JSON.parse(raw) as InterceptedMessage[];
    return all.slice(0, limit);
  }

  async append(message: InterceptedMessage): Promise<void> {
    const current = await this.list(MAX_STORED);
    // Replace existing entry with same id (re-processing guard) or prepend.
    const filtered = current.filter((m) => m.id !== message.id);
    const next = [message, ...filtered].slice(0, MAX_STORED);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(next));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
  }
}
