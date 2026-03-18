import { Config } from '@domain/entities/Config';

export interface ConfigRepository {
  get(): Promise<Config>;
  save(config: Config): Promise<void>;
}
