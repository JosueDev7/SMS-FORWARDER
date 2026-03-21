import { SendTelegramTest } from '@application/usecases/SendTelegramTest';
import { TelegramGateway } from '@application/ports/TelegramGateway';
import { Config, DEFAULT_SCHEDULE } from '@domain/entities/Config';
import { EventLog } from '@domain/entities/EventLog';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { EventRepository } from '@domain/repositories/EventRepository';
import { encodeBase64 } from '@shared/utils/base64';

class InMemoryConfigRepository implements ConfigRepository {
  constructor(private readonly config: Config) {}
  get(): Promise<Config> {
    return Promise.resolve(this.config);
  }
  save(): Promise<void> {
    return Promise.resolve();
  }
}

class InMemoryEventRepository implements EventRepository {
  public events: EventLog[] = [];
  list(limit?: number): Promise<EventLog[]> {
    return Promise.resolve(this.events.slice(0, limit ?? this.events.length));
  }
  append(eventLog: EventLog): Promise<void> {
    this.events.unshift(eventLog);
    return Promise.resolve();
  }
}

class TelegramGatewayMock implements TelegramGateway {
  public called = 0;
  async sendMessage(): Promise<void> {
    this.called += 1;
  }
}

describe('SendTelegramTest', () => {
  it('sends test telegram message and logs test event', async () => {
    const gateway = new TelegramGatewayMock();
    const events = new InMemoryEventRepository();

    const usecase = new SendTelegramTest(
      new InMemoryConfigRepository({
        telegramBotTokenBase64: encodeBase64('token'),
        telegramChatId: 'chat-id',
        telegramLinks: [
          { id: 'link-1', label: 'Test', botTokenBase64: encodeBase64('token'), chatId: 'chat-id', enabled: true },
        ],
        serviceEnabled: true,
        schedule: DEFAULT_SCHEDULE,
      }),
      gateway,
      events,
    );

    await usecase.execute();

    expect(gateway.called).toBe(1);
    expect(events.events[0]?.type).toBe('TEST');
  });

  it('throws when config is incomplete', async () => {
    const usecase = new SendTelegramTest(
      new InMemoryConfigRepository({
        telegramBotTokenBase64: '',
        telegramChatId: '',
        telegramLinks: [],
        serviceEnabled: true,
        schedule: DEFAULT_SCHEDULE,
      }),
      new TelegramGatewayMock(),
      new InMemoryEventRepository(),
    );

    await expect(usecase.execute()).rejects.toThrow('No hay Telegram Links activos configurados.');
  });
});
