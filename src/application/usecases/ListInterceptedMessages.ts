import { InterceptedMessage } from '@domain/entities/InterceptedMessage';
import { MessageRepository } from '@domain/repositories/MessageRepository';

export class ListInterceptedMessages {
  constructor(private readonly messageRepository: MessageRepository) {}

  execute(limit = 100): Promise<InterceptedMessage[]> {
    return this.messageRepository.list(limit);
  }
}
