import { useQuery } from '@tanstack/react-query';
import { Invoice, InvoiceLine } from '../../../core/api/types';
import { invoiceQueryKeys } from './useInvoice';

export function useInvoiceLine(invoiceId: string, lineItemId: string) {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    queryFn: async (): Promise<Invoice> => {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return response.json();
    },
    enabled: !!invoiceId && !!lineItemId,
    select: (invoice: Invoice): InvoiceLine | undefined => {
      return invoice.lines?.find((line) => line.id === lineItemId);
    },
  });
}
