import { EventLog } from '@domain/entities/EventLog';
import { EventRepository } from '@domain/repositories/EventRepository';

export class ListRecentEvents {
  constructor(private readonly eventRepository: EventRepository) {}

  execute(limit = 50): Promise<EventLog[]> {
    return this.eventRepository.list(limit);
  }
}
