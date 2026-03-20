import { InterceptedMessage } from '@domain/entities/InterceptedMessage';

export interface MessageRepository {
  list(limit?: number): Promise<InterceptedMessage[]>;
  append(message: InterceptedMessage): Promise<void>;
  clear(): Promise<void>;
}
