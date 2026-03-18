import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventLog } from '@domain/entities/EventLog';
import { EventRepository } from '@domain/repositories/EventRepository';
import { STORAGE_KEYS } from '@infrastructure/storage/keys';

export class EventStorageRepository implements EventRepository {
  async list(limit = 50): Promise<EventLog[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      return [];
    }
    const all = JSON.parse(raw) as EventLog[];
    return all.slice(0, limit);
  }

  async append(eventLog: EventLog): Promise<void> {
    const current = await this.list(200);
    const next = [eventLog, ...current].slice(0, 200);
    await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(next));
  }
}
