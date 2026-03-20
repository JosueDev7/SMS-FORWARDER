export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  level: LogLevel;
  tag: string;
  message: string;
  timestamp: number;
}

const MAX_ENTRIES = 500;
const _entries: LogEntry[] = [];
const _listeners = new Set<() => void>();
let _counter = 0;

function addEntry(level: LogLevel, tag: string, message: string): void {
  const entry: LogEntry = {
    id: String(++_counter),
    level,
    tag,
    message,
    timestamp: Date.now(),
  };
  _entries.push(entry);
  if (_entries.length > MAX_ENTRIES) {
    _entries.splice(0, _entries.length - MAX_ENTRIES);
  }
  _listeners.forEach((fn) => fn());
}

export const logger = {
  debug: (tag: string, message: string): void => addEntry('DEBUG', tag, message),
  info: (tag: string, message: string): void => addEntry('INFO', tag, message),
  warn: (tag: string, message: string): void => addEntry('WARN', tag, message),
  error: (tag: string, message: string): void => addEntry('ERROR', tag, message),

  getEntries: (): LogEntry[] => [..._entries],

  clear: (): void => {
    _entries.length = 0;
    _listeners.forEach((fn) => fn());
  },

  subscribe: (fn: () => void): (() => void) => {
    _listeners.add(fn);
    return () => {
      _listeners.delete(fn);
    };
  },
};
