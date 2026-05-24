import { db } from '../config/db';
import { invoices_view, inventory_view, customer_balances_view } from '../db/schema';
import { State } from './state.reducer';
import { computeSha256, stableStringify } from './hash.util';
import { LedgerCorruptionError } from './errors';

export async function projectState(
  state: State,
  projectionVersion: number,
  expectedStateRootHash?: string,
  tx?: any
): Promise<void> {
  const executor = tx || db;

  const computedHash = computeSha256(stableStringify(state));
  if (expectedStateRootHash && computedHash !== expectedStateRootHash) {
    throw new LedgerCorruptionError(
      `Projection verification failed: computed stateRootHash ${computedHash} ` +
        `does not match expected stateRootHash ${expectedStateRootHash}`
    );
  }

  await executor.delete(invoices_view);
  await executor.delete(inventory_view);
  await executor.delete(customer_balances_view);

  if (state.invoices.length > 0) {
    await executor.insert(invoices_view).values(
      state.invoices.map(inv => ({
        id: inv.id,
        customerId: inv.customerId,
        subtotal: inv.subtotal,
        taxTotal: inv.taxTotal,
        discountTotal: inv.discountTotal,
        grandTotal: inv.grandTotal,
        amountPaid: inv.amountPaid,
        status: inv.status,
        items: inv.items,
        createdAt: inv.createdAt,
        projectionVersion,
      }))
    );
  }

  if (state.inventory.length > 0) {
    await executor.insert(inventory_view).values(
      state.inventory.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        lastUpdated: item.lastUpdated,
        projectionVersion,
      }))
    );
  }

  const balanceEntries = Object.entries(state.balances);
  if (balanceEntries.length > 0) {
    const lastUpdated = Date.now();
    await executor.insert(customer_balances_view).values(
      balanceEntries.map(([customerId, balance]) => ({
        customerId,
        balance,
        lastUpdated,
        projectionVersion,
      }))
    );
  }
}
export default projectState;
