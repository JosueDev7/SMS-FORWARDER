import { Rule } from '@domain/entities/Rule';

export interface RuleRepository {
  list(): Promise<Rule[]>;
  getById(id: string): Promise<Rule | null>;
  create(rule: Rule): Promise<void>;
  update(rule: Rule): Promise<void>;
  remove(id: string): Promise<void>;
}
