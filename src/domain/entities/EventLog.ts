export type EventType = 'RECEIVED' | 'FORWARDED' | 'DROPPED' | 'ERROR' | 'TEST';

export interface EventLog {
  id: string;
  type: EventType;
  message: string;
  smsId?: string;
  createdAt: number;
}
