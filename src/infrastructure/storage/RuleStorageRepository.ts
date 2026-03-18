import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rule } from '@domain/entities/Rule';
import { RuleRepository } from '@domain/repositories/RuleRepository';
import { STORAGE_KEYS } from '@infrastructure/storage/keys';

export class RuleStorageRepository implements RuleRepository {
  async list(): Promise<Rule[]> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.RULES);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as Rule[];
  }

  async getById(id: string): Promise<Rule | null> {
    const rules = await this.list();
    return rules.find((rule) => rule.id === id) ?? null;
  }

  async create(rule: Rule): Promise<void> {
    const rules = await this.list();
    rules.unshift(rule);
    await AsyncStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  }

  async update(rule: Rule): Promise<void> {
    const rules = await this.list();
    const next = rules.map((current) => (current.id === rule.id ? rule : current));
    await AsyncStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(next));
  }

  async remove(id: string): Promise<void> {
    const rules = await this.list();
    const next = rules.filter((rule) => rule.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(next));
  }
}
