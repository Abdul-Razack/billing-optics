import { gt, asc } from 'drizzle-orm';
import { db } from '../config/db';
import { ledger_events } from '../db/schema';
import { Snapshot } from './snapshot.store';
import { State, applyEvent } from './state.reducer';
import { Event } from './event.store';
import { computeSha256, stableStringify } from './hash.util';
import { LedgerCorruptionError } from './errors';

export function replay(fromSnapshot: Snapshot | null, events: Event[]): State {
  let state: State = fromSnapshot
    ? {
        invoices: fromSnapshot.state.invoices.map(inv => ({
          ...inv,
          items: inv.items.map(item => ({ ...item })),
        })),
        inventory: fromSnapshot.state.inventory.map(item => ({ ...item })),
        balances: { ...fromSnapshot.state.balances },
      }
    : { invoices: [], inventory: [], balances: {} };

  let filteredEvents = events;
  if (fromSnapshot) {
    filteredEvents = events.filter(e => e.id > fromSnapshot.lastEventId);
  }

  // Sort by sequenceNumber ASC (PRIMARY), timestamp ASC (SECONDARY fallback)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const seqA = Number(a.sequenceNumber);
    const seqB = Number(b.sequenceNumber);
    if (seqA !== seqB) {
      return seqA - seqB;
    }
    return a.timestamp - b.timestamp;
  });

  for (const event of sortedEvents) {
    state = applyEvent(state, event);
  }

  // Replay Verification Checksum
  if (fromSnapshot) {
    const isAtSnapshotState =
      sortedEvents.length === 0 ||
      sortedEvents[sortedEvents.length - 1].id === fromSnapshot.lastEventId;

    if (isAtSnapshotState) {
      const computedStateHash = computeSha256(stableStringify(state));
      if (computedStateHash !== fromSnapshot.stateRootHash) {
        throw new LedgerCorruptionError(
          `Replay verification checksum mismatch: final state hash ${computedStateHash} does not match snapshot stateRootHash ${fromSnapshot.stateRootHash}`
        );
      }
    }
  }

  return state;
}

export async function fetchEventsAfter(lastEventId: string | null, tx?: any): Promise<Event[]> {
  const executor = tx || db;

  if (!lastEventId) {
    const results = await executor
      .select()
      .from(ledger_events)
      .orderBy(asc(ledger_events.sequenceNumber), asc(ledger_events.timestamp));
    return results as Event[];
  }

  const results = await executor
    .select()
    .from(ledger_events)
    .where(gt(ledger_events.id, lastEventId))
    .orderBy(asc(ledger_events.sequenceNumber), asc(ledger_events.timestamp));

  return results as Event[];
}

export async function replayFromDb(fromSnapshot: Snapshot | null, tx?: any): Promise<State> {
  const lastEventId = fromSnapshot ? fromSnapshot.lastEventId : null;
  const events = await fetchEventsAfter(lastEventId, tx);
  return replay(fromSnapshot, events);
}
