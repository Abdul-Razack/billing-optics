import { useQuery } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { InvoiceTotals } from '../../../core/api/payment.types';
import { Invoice } from '../../../core/api/types';

export function useInvoiceTotals(invoiceId: string) {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    queryFn: async (): Promise<Invoice> => {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return response.json();
    },
    enabled: !!invoiceId,
    select: (invoice: Invoice): InvoiceTotals => {
      const subtotal = invoice.lines?.reduce((acc: number, item: any) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0) || 0;
      const tax = subtotal * 0.1; // Example tax calculation
      const discount = 0;
      const grandTotal = subtotal + tax - discount;
      const paidAmount = invoice.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
      const balanceAmount = grandTotal - paidAmount;

      return {
        subtotal,
        tax,
        discount,
        grandTotal,
        paidAmount,
        balanceAmount,
      };
    },
  });
}
