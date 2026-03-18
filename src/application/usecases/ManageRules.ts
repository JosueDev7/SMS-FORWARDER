import { Rule } from '@domain/entities/Rule';
import { RuleRepository } from '@domain/repositories/RuleRepository';
import { generateId } from '@shared/utils/id';

export class ManageRules {
  constructor(private readonly ruleRepository: RuleRepository) {}

  list(): Promise<Rule[]> {
    return this.ruleRepository.list();
  }

  async create(input: Omit<Rule, 'id'>): Promise<Rule> {
    const rule: Rule = {
      ...input,
      id: generateId(),
    };
    await this.ruleRepository.create(rule);
    return rule;
  }

  update(rule: Rule): Promise<void> {
    return this.ruleRepository.update(rule);
  }

  remove(id: string): Promise<void> {
    return this.ruleRepository.remove(id);
  }
}
