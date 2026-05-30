import { Money } from '../../domain/utils/money.util';
import { calculateEventHash, stableStringify, computeSha256 } from '../hash.util';
import { applyEvent, State } from '../state.reducer';
import { checkInvariants } from '../invariant.checker';
import { replay } from '../replay.engine';
import { LedgerCorruptionError } from '../errors';

function runTests() {
  console.log('=== RUNNING BANK-GRADE LEDGER ENGINE TESTS ===\n');

  // Test 1: Money Utility
  console.log('Test 1: Money Utility...');
  const m1 = Money.fromPaise(1000);
  const m2 = Money.fromPaise(500);
  if (m1.add(m2).getPaise() !== 1500) throw new Error('Money.add failed');
  if (m1.subtract(m2).getPaise() !== 500) throw new Error('Money.subtract failed');
  if (m1.multiply(1.18).getPaise() !== 1180) throw new Error('Money.multiply failed');
  if (m1.isLessThanZero()) throw new Error('Money.isLessThanZero failed');

  // Money allocation test
  const allocated = Money.fromPaise(100).allocate([1, 1, 1]);
  const allocatedSum = allocated.reduce((sum, m) => sum + m.getPaise(), 0);
  if (allocatedSum !== 100) throw new Error(`Money.allocate sum mismatch: ${allocatedSum}`);
  if (allocated[0].getPaise() !== 34 || allocated[1].getPaise() !== 33 || allocated[2].getPaise() !== 33) {
    throw new Error('Money.allocate division not matching expectations');
  }
  console.log('✔ Money Utility tests passed!\n');

  // Test 2: Stable stringify & Event Hash
  console.log('Test 2: Stable Stringify & Hashing...');
  const objA = { z: 1, a: { y: 2, x: 3 } };
  const objB = { a: { x: 3, y: 2 }, z: 1 };
  if (stableStringify(objA) !== stableStringify(objB)) {
    throw new Error('Stable stringify failed to sort keys consistently');
  }

  const dummyEvent = {
    id: 'evt_1',
    type: 'INVOICE_CREATED',
    payload: { invoiceId: 'inv_1', customerId: 'cust_1' },
    timestamp: 1672531199000,
    prevHash: null,
    idempotencyKey: 'idem_1',
    sequenceNumber: 1,
  };
  const hash1 = calculateEventHash(dummyEvent);
  const dummyEvent2 = { ...dummyEvent, hash: 'some_arbitrary_hash' };
  const hash2 = calculateEventHash(dummyEvent2);
  if (hash1 !== hash2) {
    throw new Error('Hash calculation must exclude the hash field itself');
  }
  console.log('✔ Stable Stringify & Hashing tests passed!\n');

  // Test 3: State Reducer
  console.log('Test 3: State Reducer...');
  let state: State = { invoices: [], inventory: [], balances: {} };

  state = applyEvent(state, {
    type: 'INVOICE_CREATED',
    payload: { invoiceId: 'inv_1', customerId: 'cust_1' },
    timestamp: 1000,
  });
  if (state.invoices.length !== 1 || state.invoices[0].id !== 'inv_1') {
    throw new Error('INVOICE_CREATED reducer failed');
  }
  if (state.balances['cust_1'] !== 0) {
    throw new Error('INVOICE_CREATED customer balance initialization failed');
  }

  state = applyEvent(state, {
    type: 'ITEM_ADDED',
    payload: { invoiceId: 'inv_1', productId: 'prod_1', quantity: 2, price: 1000 },
    timestamp: 2000,
  });
  if (state.invoices[0].subtotal !== 2000 || state.invoices[0].grandTotal !== 2000) {
    throw new Error('ITEM_ADDED reducer failed');
  }
  if (state.balances['cust_1'] !== 2000) {
    throw new Error('ITEM_ADDED balance update failed');
  }

  console.log('✔ State Reducer tests passed!\n');

  // Test 4: Replay Engine and Invariant Checker with sequence gaps & idempotency
  console.log('Test 4: Replay & Invariant Engine...');
  const events = [
    {
      id: 'e1',
      type: 'INVOICE_CREATED',
      payload: { invoiceId: 'inv_1', customerId: 'cust_1' },
      timestamp: 1000,
      prevHash: null,
      idempotencyKey: 'idem_1',
      sequenceNumber: 1,
      hash: '',
    },
    {
      id: 'e2',
      type: 'ITEM_ADDED',
      payload: { invoiceId: 'inv_1', productId: 'prod_1', quantity: 1, price: 100 },
      timestamp: 2000,
      prevHash: '',
      idempotencyKey: 'idem_2',
      sequenceNumber: 2,
      hash: '',
    },
  ];

  events[0].hash = calculateEventHash(events[0]);
  events[1].prevHash = events[0].hash;
  events[1].hash = calculateEventHash(events[1]);

  const replayedState = replay(null, events);
  if (replayedState.invoices.length !== 1 || replayedState.balances['cust_1'] !== 100) {
    throw new Error('Replay reconstruction failed');
  }

  // Validate checker passes
  checkInvariants(replayedState, events, null);

  // Expect failure on sequence gap
  const gapEvents = [
    events[0],
    { ...events[1], sequenceNumber: 3 }, // Gap from 1 to 3
  ];
  gapEvents[1].hash = calculateEventHash(gapEvents[1]);
  try {
    checkInvariants(replayedState, gapEvents, null);
    throw new Error('Should have failed on sequence gap');
  } catch (e: any) {
    if (!(e instanceof LedgerCorruptionError)) throw e;
  }

  // Expect failure on duplicate idempotency key
  const duplicateIdemEvents = [
    events[0],
    { ...events[1], idempotencyKey: 'idem_1' }, // Duplicate
  ];
  duplicateIdemEvents[1].hash = calculateEventHash(duplicateIdemEvents[1]);
  try {
    checkInvariants(replayedState, duplicateIdemEvents, null);
    throw new Error('Should have failed on duplicate idempotency key');
  } catch (e: any) {
    if (!(e instanceof LedgerCorruptionError)) throw e;
  }

  // Test state root hash checksum in replay
  const stateRootHash = computeSha256(stableStringify(replayedState));
  const dummySnapshot = {
    id: 'snap_1',
    state: replayedState,
    lastEventId: 'e2',
    lastEventHash: events[1].hash,
    createdAt: Date.now(),
    stateRootHash,
  };

  // Replaying with correct checksum should succeed
  replay(dummySnapshot, []);

  // Replaying with broken checksum should fail
  const badSnapshot = { ...dummySnapshot, stateRootHash: 'broken_state_root' };
  try {
    replay(badSnapshot, []);
    throw new Error('Should have failed on state root hash verification mismatch');
  } catch (e: any) {
    if (!(e instanceof LedgerCorruptionError)) throw e;
  }

  console.log('✔ Replay & Invariants tests passed!\n');

  console.log('==================================');
  console.log('ALL BANK-GRADE TESTS PASSED! 🚀');
  console.log('==================================');
}

describe('ledger engine', () => {
  it('should pass all bank-grade ledger tests', () => {
    runTests();
  });
});
