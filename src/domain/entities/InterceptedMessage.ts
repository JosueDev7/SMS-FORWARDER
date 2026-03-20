export type MessageStatus = 'FORWARDED' | 'DROPPED' | 'ERROR';

export interface InterceptedMessage {
  /** Same as the originating SMS id. */
  id: string;
  sender: string;
  body: string;
  receivedAt: number;
  status: MessageStatus;
  statusDetail?: string;
  processedAt: number;
}
