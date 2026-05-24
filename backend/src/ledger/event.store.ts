import { desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { ledger_events } from '../db/schema';
import { calculateEventHash } from './hash.util';
import { LedgerCorruptionError } from './errors';

export interface Event {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  prevHash: string | null;
  hash: string;
  idempotencyKey: string;
  sequenceNumber: number;
}

export async function appendEvent(event: Event, tx?: any): Promise<void> {
  const executeWithLock = async (transaction: any) => {
    const lastEvents = await transaction
      .select()
      .from(ledger_events)
      .orderBy(desc(ledger_events.sequenceNumber))
      .limit(1)
      .for('update');

    const lastEvent = lastEvents[0];

    const existingKey = await transaction
      .select()
      .from(ledger_events)
      .where(eq(ledger_events.idempotencyKey, event.idempotencyKey))
      .limit(1);

    if (existingKey.length > 0) {
      throw new LedgerCorruptionError(
        `Duplicate event write: idempotencyKey ${event.idempotencyKey} already exists`
      );
    }

    const lastSeq = lastEvent ? Number(lastEvent.sequenceNumber) : 0;
    const expectedSeq = lastSeq + 1;
    if (event.sequenceNumber !== expectedSeq) {
      throw new LedgerCorruptionError(
        `Sequence gap detected for event ${event.id}: expected sequence ${expectedSeq}, got ${event.sequenceNumber}`
      );
    }

    const lastHash = lastEvent ? lastEvent.hash : null;
    if (event.prevHash !== lastHash) {
      throw new LedgerCorruptionError(
        `Hash chain integrity broken for event ${event.id}: expected prevHash ${lastHash}, got ${event.prevHash}`
      );
    }

    const expectedHash = calculateEventHash(event);
    if (event.hash !== expectedHash) {
      throw new LedgerCorruptionError(
        `Hash mismatch for event ${event.id}: expected ${expectedHash}, got ${event.hash}`
      );
    }

    await transaction.insert(ledger_events).values({
      id: event.id,
      type: event.type,
      payload: event.payload,
      timestamp: event.timestamp,
      prevHash: event.prevHash,
      hash: event.hash,
      idempotencyKey: event.idempotencyKey,
      sequenceNumber: event.sequenceNumber,
    });
  };

  if (tx) {
    await executeWithLock(tx);
  } else {
    await db.transaction(async (t) => {
      await executeWithLock(t);
    });
  }
}
export default appendEvent;
