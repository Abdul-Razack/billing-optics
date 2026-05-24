import { createHash } from 'crypto';

export function stableStringify(obj: any): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

export function computeSha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function calculateEventHash(event: {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  prevHash: string | null;
  idempotencyKey: string;
  sequenceNumber: number;
}): string {
  const normalized = {
    id: event.id,
    type: event.type,
    payload: event.payload,
    timestamp: event.timestamp,
    prevHash: event.prevHash,
    idempotencyKey: event.idempotencyKey,
    sequenceNumber: event.sequenceNumber,
  };
  return computeSha256(stableStringify(normalized));
}
