import { ManageRules } from '@application/usecases/ManageRules';
import { Rule } from '@domain/entities/Rule';
import { RuleRepository } from '@domain/repositories/RuleRepository';

class InMemoryRuleRepository implements RuleRepository {
  constructor(private readonly rules: Rule[] = []) {}
  list(): Promise<Rule[]> {
    return Promise.resolve(this.rules);
  }
  getById(id: string): Promise<Rule | null> {
    return Promise.resolve(this.rules.find((rule) => rule.id === id) ?? null);
  }
  create(rule: Rule): Promise<void> {
    this.rules.push(rule);
    return Promise.resolve();
  }
  update(rule: Rule): Promise<void> {
    const idx = this.rules.findIndex((item) => item.id === rule.id);
    this.rules[idx] = rule;
    return Promise.resolve();
  }
  remove(id: string): Promise<void> {
    const next = this.rules.filter((rule) => rule.id !== id);
    this.rules.length = 0;
    this.rules.push(...next);
    return Promise.resolve();
  }
}

describe('ManageRules', () => {
  it('creates, updates and removes rules', async () => {
    const repository = new InMemoryRuleRepository();
    const usecase = new ManageRules(repository);

    const created = await usecase.create({
      name: 'OTP',
      enabled: true,
      pattern: 'otp',
      useRegex: false,
    });

    expect(created.id).toBeTruthy();
    expect((await usecase.list()).length).toBe(1);

    await usecase.update({ ...created, enabled: false });
    const updated = await repository.getById(created.id);
    expect(updated?.enabled).toBe(false);

    await usecase.remove(created.id);
    expect((await usecase.list()).length).toBe(0);
  });
});
