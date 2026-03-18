import { ProcessIncomingSMS } from '@application/usecases/ProcessIncomingSMS';
import { Config } from '@domain/entities/Config';
import { EventLog } from '@domain/entities/EventLog';
import { Rule } from '@domain/entities/Rule';
import { SMS } from '@domain/entities/SMS';
import { ConfigRepository } from '@domain/repositories/ConfigRepository';
import { EventRepository } from '@domain/repositories/EventRepository';
import { RuleRepository } from '@domain/repositories/RuleRepository';
import { TelegramGateway } from '@application/ports/TelegramGateway';
import { encodeBase64 } from '@shared/utils/base64';

class InMemoryRuleRepository implements RuleRepository {
  constructor(private readonly items: Rule[]) {}
  list(): Promise<Rule[]> {
    return Promise.resolve(this.items);
  }
  getById(id: string): Promise<Rule | null> {
    return Promise.resolve(this.items.find((x) => x.id === id) ?? null);
  }
  create(rule: Rule): Promise<void> {
    this.items.push(rule);
    return Promise.resolve();
  }
  update(rule: Rule): Promise<void> {
    const index = this.items.findIndex((x) => x.id === rule.id);
    this.items[index] = rule;
    return Promise.resolve();
  }
  remove(id: string): Promise<void> {
    const index = this.items.findIndex((x) => x.id === id);
    this.items.splice(index, 1);
    return Promise.resolve();
  }
}

class InMemoryConfigRepository implements ConfigRepository {
  constructor(private config: Config) {}
  get(): Promise<Config> {
    return Promise.resolve(this.config);
  }
  save(config: Config): Promise<void> {
    this.config = config;
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
  public sent = 0;
  async sendMessage(): Promise<void> {
    this.sent += 1;
  }
}

class TelegramGatewayFailureMock implements TelegramGateway {
  async sendMessage(): Promise<void> {
    throw new Error('network down');
  }
}

describe('ProcessIncomingSMS', () => {
  const sms: SMS = {
    id: 'sms-1',
    sender: '+51999999999',
    body: 'Tu codigo OTP es 1234',
    receivedAt: Date.now(),
  };

  it('forwards when includes rule matches', async () => {
    const gateway = new TelegramGatewayMock();
    const usecase = new ProcessIncomingSMS({
      ruleRepository: new InMemoryRuleRepository([
        { id: 'r1', name: 'OTP', enabled: true, pattern: 'OTP', useRegex: false },
      ]),
      configRepository: new InMemoryConfigRepository({
        telegramBotTokenBase64: encodeBase64('token'),
        telegramChatId: 'chat',
        serviceEnabled: true,
      }),
      eventRepository: new InMemoryEventRepository(),
      telegramGateway: gateway,
    });

    await usecase.execute(sms);

    expect(gateway.sent).toBe(1);
  });

  it('drops sms when service disabled', async () => {
    const eventRepository = new InMemoryEventRepository();
    const gateway = new TelegramGatewayMock();

    const usecase = new ProcessIncomingSMS({
      ruleRepository: new InMemoryRuleRepository([
        { id: 'r1', name: 'OTP', enabled: true, pattern: 'OTP', useRegex: false },
      ]),
      configRepository: new InMemoryConfigRepository({
        telegramBotTokenBase64: encodeBase64('token'),
        telegramChatId: 'chat',
        serviceEnabled: false,
      }),
      eventRepository,
      telegramGateway: gateway,
    });

    await usecase.execute(sms);

    expect(gateway.sent).toBe(0);
    expect(eventRepository.events.some((event) => event.type === 'DROPPED')).toBe(true);
  });

  it('supports regex rule matching', async () => {
    const gateway = new TelegramGatewayMock();

    const usecase = new ProcessIncomingSMS({
      ruleRepository: new InMemoryRuleRepository([
        { id: 'r1', name: 'Regex', enabled: true, pattern: 'codigo\\s+OTP', useRegex: true },
      ]),
      configRepository: new InMemoryConfigRepository({
        telegramBotTokenBase64: encodeBase64('token'),
        telegramChatId: 'chat',
        serviceEnabled: true,
      }),
      eventRepository: new InMemoryEventRepository(),
      telegramGateway: gateway,
    });

    await usecase.execute(sms);

    expect(gateway.sent).toBe(1);
  });

  it('drops sms when no rule matches', async () => {
    const eventRepository = new InMemoryEventRepository();
    const gateway = new TelegramGatewayMock();

    const usecase = new ProcessIncomingSMS({
      ruleRepository: new InMemoryRuleRepository([
        { id: 'r1', name: 'OTP', enabled: true, pattern: 'saldo', useRegex: false },
      ]),
      configRepository: new InMemoryConfigRepository({
        telegramBotTokenBase64: encodeBase64('token'),
        telegramChatId: 'chat',
        serviceEnabled: true,
      }),
      eventRepository,
      telegramGateway: gateway,
    });

    await usecase.execute(sms);

    expect(gateway.sent).toBe(0);
    expect(eventRepository.events.some((event) => event.type === 'DROPPED')).toBe(true);
  });

  it('handles invalid regex pattern safely', async () => {
    const eventRepository = new InMemoryEventRepository();
    const gateway = new TelegramGatewayMock();

    const usecase = new ProcessIncomingSMS({
      ruleRepository: new InMemoryRuleRepository([
        { id: 'r1', name: 'broken', enabled: true, pattern: '[a-z', useRegex: true },
      ]),
      configRepository: new InMemoryConfigRepository({
        telegramBotTokenBase64: encodeBase64('token'),
        telegramChatId: 'chat',
        serviceEnabled: true,
      }),
      eventRepository,
      telegramGateway: gateway,
    });

    await usecase.execute(sms);

    expect(gateway.sent).toBe(0);
    expect(eventRepository.events.some((event) => event.type === 'DROPPED')).toBe(true);
  });

  it('logs error when telegram config is incomplete', async () => {
    const eventRepository = new InMemoryEventRepository();
    const gateway = new TelegramGatewayMock();

    const usecase = new ProcessIncomingSMS({
      ruleRepository: new InMemoryRuleRepository([
        { id: 'r1', name: 'OTP', enabled: true, pattern: 'OTP', useRegex: false },
      ]),
      configRepository: new InMemoryConfigRepository({
        telegramBotTokenBase64: '',
        telegramChatId: '',
        serviceEnabled: true,
      }),
      eventRepository,
      telegramGateway: gateway,
    });

    await usecase.execute(sms);

    expect(gateway.sent).toBe(0);
    expect(eventRepository.events.some((event) => event.type === 'ERROR')).toBe(true);
  });

  it('logs error when telegram gateway throws', async () => {
    const eventRepository = new InMemoryEventRepository();

    const usecase = new ProcessIncomingSMS({
      ruleRepository: new InMemoryRuleRepository([
        { id: 'r1', name: 'OTP', enabled: true, pattern: 'OTP', useRegex: false },
      ]),
      configRepository: new InMemoryConfigRepository({
        telegramBotTokenBase64: encodeBase64('token'),
        telegramChatId: 'chat',
        serviceEnabled: true,
      }),
      eventRepository,
      telegramGateway: new TelegramGatewayFailureMock(),
    });

    await usecase.execute(sms);

    expect(eventRepository.events.some((event) => event.type === 'ERROR')).toBe(true);
  });
});
