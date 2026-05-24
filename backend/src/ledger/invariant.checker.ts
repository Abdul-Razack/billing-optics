import { State } from './state.reducer';
import { Event } from './event.store';
import { Snapshot } from './snapshot.store';
import { LedgerCorruptionError } from './errors';
import { calculateEventHash } from './hash.util';
import { Money } from '../domain/utils/money.util';

export function checkInvariants(
  state: State,
  events: Event[],
  fromSnapshot: Snapshot | null
): void {
  for (const [customerId, balance] of Object.entries(state.balances)) {
    if (balance < 0) {
      throw new LedgerCorruptionError(
        `Invariant violation: Negative balance for customer ${customerId}: ${balance}`
      );
    }
  }

  for (const invoice of state.invoices) {
    const subtotal = Money.fromPaise(invoice.subtotal);
    const taxTotal = Money.fromPaise(invoice.taxTotal);
    const discountTotal = Money.fromPaise(invoice.discountTotal);
    const grandTotal = Money.fromPaise(invoice.grandTotal);

    const calculatedGrandTotal = subtotal.add(taxTotal).subtract(discountTotal);
    if (!calculatedGrandTotal.equals(grandTotal)) {
      throw new LedgerCorruptionError(
        `Invariant violation: Invoice ${invoice.id} grand total mismatch. ` +
          `Subtotal (${invoice.subtotal}) + Tax (${invoice.taxTotal}) - Discount (${invoice.discountTotal}) ` +
          `should equal ${calculatedGrandTotal.getPaise()}, but got ${invoice.grandTotal}`
      );
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    const seqA = Number(a.sequenceNumber);
    const seqB = Number(b.sequenceNumber);
    if (seqA !== seqB) {
      return seqA - seqB;
    }
    return a.timestamp - b.timestamp;
  });

  const seenIdempotencyKeys = new Set<string>();

  for (let i = 0; i < sortedEvents.length; i++) {
    const currentEvent = sortedEvents[i];

    if (seenIdempotencyKeys.has(currentEvent.idempotencyKey)) {
      throw new LedgerCorruptionError(
        `Invariant violation: Duplicate idempotency key ${currentEvent.idempotencyKey} detected in sequence`
      );
    }
    seenIdempotencyKeys.add(currentEvent.idempotencyKey);

    if (i === 0) {
      if (!fromSnapshot && Number(currentEvent.sequenceNumber) !== 1) {
        throw new LedgerCorruptionError(
          `Invariant violation: First sequence number must be 1, got ${currentEvent.sequenceNumber}`
        );
      }
    } else {
      const prevEvent = sortedEvents[i - 1];
      const expectedSeq = Number(prevEvent.sequenceNumber) + 1;
      if (Number(currentEvent.sequenceNumber) !== expectedSeq) {
        throw new LedgerCorruptionError(
          `Invariant violation: Sequence gap detected. Expected sequence ${expectedSeq}, got ${currentEvent.sequenceNumber}`
        );
      }
    }

    const expectedHash = calculateEventHash(currentEvent);
    if (currentEvent.hash !== expectedHash) {
      throw new LedgerCorruptionError(
        `Hash integrity violation at event ${currentEvent.id}: expected hash ${expectedHash}, got ${currentEvent.hash}`
      );
    }

    if (i === 0) {
      if (fromSnapshot) {
        if (currentEvent.prevHash !== fromSnapshot.lastEventHash) {
          throw new LedgerCorruptionError(
            `Hash chain link broken: first event ${currentEvent.id} prevHash ${currentEvent.prevHash} ` +
              `does not match snapshot lastEventHash ${fromSnapshot.lastEventHash}`
          );
        }
      } else {
        if (currentEvent.prevHash !== null) {
          throw new LedgerCorruptionError(
            `Hash chain link broken: first event ${currentEvent.id} prevHash must be null, got ${currentEvent.prevHash}`
          );
        }
      }
    } else {
      const prevEvent = sortedEvents[i - 1];
      if (currentEvent.prevHash !== prevEvent.hash) {
        throw new LedgerCorruptionError(
          `Hash chain link broken: event ${currentEvent.id} prevHash ${currentEvent.prevHash} ` +
            `does not link to previous event ${prevEvent.id} hash ${prevEvent.hash}`
        );
      }
    }
  }
}
export default checkInvariants;
