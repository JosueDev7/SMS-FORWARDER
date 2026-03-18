import { EventLog } from '@domain/entities/EventLog';

export interface EventRepository {
  list(limit?: number): Promise<EventLog[]>;
  append(eventLog: EventLog): Promise<void>;
}
