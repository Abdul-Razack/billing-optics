/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { InvoiceTotals } from '../../../core/api/payment.types';
import { Invoice } from '../../../core/api/types';
import { apiClient } from '../../../core/api/client';

export function useInvoiceTotals(invoiceId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    queryFn: async (): Promise<Invoice> => {
      if (invoiceId.startsWith('INV-')) {
        const existingData = queryClient.getQueryData<Invoice>(invoiceQueryKeys.detail(invoiceId));
        if (existingData) return existingData;
        return { id: invoiceId, customerId: '', total: 0, lineItemIds: [], lines: [] } as any;
      }
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    },
    enabled: !!invoiceId,
    select: (invoice: Invoice): InvoiceTotals => {
      const subtotal = invoice.lines?.reduce((acc: number, item: any) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0) || 0;
      const tax = 0; // Removing frontend mock tax to match backend checkout engine
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
