import { Buffer } from 'buffer';

export const encodeBase64 = (raw: string): string => {
  return Buffer.from(raw, 'utf-8').toString('base64');
};

export const decodeBase64 = (encoded: string): string => {
  if (!encoded) {
    return '';
  }
  return Buffer.from(encoded, 'base64').toString('utf-8');
};
