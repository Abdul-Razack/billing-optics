import { desc } from 'drizzle-orm';
import { db } from '../config/db';
import { ledger_snapshots } from '../db/schema';
import { State } from './state.reducer';
import { randomUUID } from 'crypto';
import { stableStringify, computeSha256 } from './hash.util';
import { LedgerCorruptionError } from './errors';

export interface Snapshot {
  id: string;
  state: State;
  lastEventId: string;
  lastEventHash: string;
  createdAt: number;
  stateRootHash: string;
}

export async function saveSnapshot(
  state: State,
  lastEventId: string,
  lastEventHash: string,
  tx?: any
): Promise<Snapshot> {
  const executor = tx || db;

  const stateRootHash = computeSha256(stableStringify(state));

  const snapshot: Snapshot = {
    id: randomUUID(),
    state,
    lastEventId,
    lastEventHash,
    createdAt: Date.now(),
    stateRootHash,
  };

  await executor.insert(ledger_snapshots).values({
    id: snapshot.id,
    state: snapshot.state,
    lastEventId: snapshot.lastEventId,
    lastEventHash: snapshot.lastEventHash,
    createdAt: snapshot.createdAt,
    stateRootHash: snapshot.stateRootHash,
  });

  return snapshot;
}

export async function getLatestSnapshot(tx?: any): Promise<Snapshot | null> {
  const executor = tx || db;
  const snapshots = await executor
    .select()
    .from(ledger_snapshots)
    .orderBy(desc(ledger_snapshots.createdAt))
    .limit(1);

  if (snapshots.length === 0) {
    return null;
  }

  const snap = snapshots[0];

  const computedHash = computeSha256(stableStringify(snap.state));
  if (computedHash !== snap.stateRootHash) {
    throw new LedgerCorruptionError(
      `Snapshot integrity violation on snapshot ${snap.id}: expected hash ${snap.stateRootHash}, computed ${computedHash}`
    );
  }

  return {
    id: snap.id,
    state: snap.state as State,
    lastEventId: snap.lastEventId,
    lastEventHash: snap.lastEventHash,
    createdAt: snap.createdAt,
    stateRootHash: snap.stateRootHash,
  };
}
export default saveSnapshot;
