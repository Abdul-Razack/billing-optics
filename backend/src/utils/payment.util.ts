export function derivePaymentStatus(grandTotal: number, totalPaid: number): 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED' {
  if (totalPaid === 0) return 'UNPAID';
  if (totalPaid >= grandTotal) return 'PAID';
  if (totalPaid < 0) return 'REFUNDED'; // Future-proof for refunds
  return 'PARTIAL';
}
