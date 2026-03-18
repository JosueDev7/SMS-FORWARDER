import { ListRecentEvents } from '@application/usecases/ListRecentEvents';
import { EventLog } from '@domain/entities/EventLog';
import { EventRepository } from '@domain/repositories/EventRepository';

class InMemoryEventRepository implements EventRepository {
  constructor(private readonly events: EventLog[]) {}

  list(limit?: number): Promise<EventLog[]> {
    if (!limit) {
      return Promise.resolve(this.events);
    }
    return Promise.resolve(this.events.slice(0, limit));
  }

  append(): Promise<void> {
    return Promise.resolve();
  }
}

describe('ListRecentEvents', () => {
  it('returns the latest events with provided limit', async () => {
    const repository = new InMemoryEventRepository([
      { id: '1', type: 'RECEIVED', message: 'a', createdAt: 1 },
      { id: '2', type: 'FORWARDED', message: 'b', createdAt: 2 },
      { id: '3', type: 'DROPPED', message: 'c', createdAt: 3 },
    ]);

    const usecase = new ListRecentEvents(repository);
    const result = await usecase.execute(2);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
  });

  it('uses default limit when omitted', async () => {
    const repository = new InMemoryEventRepository([
      { id: '1', type: 'RECEIVED', message: 'a', createdAt: 1 },
    ]);

    const usecase = new ListRecentEvents(repository);
    const result = await usecase.execute();

    expect(result).toHaveLength(1);
  });
});
