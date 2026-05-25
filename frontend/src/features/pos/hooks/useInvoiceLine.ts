/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQuery } from '@tanstack/react-query';
import { Invoice, InvoiceLine } from '../../../core/api/types';
import { invoiceQueryKeys } from './useInvoice';
import { apiClient } from '../../../core/api/client';

export function useInvoiceLine(invoiceId: string, lineItemId: string) {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    queryFn: async (): Promise<Invoice> => {
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    },
    enabled: !!invoiceId && !!lineItemId,
    select: (invoice: Invoice): InvoiceLine | undefined => {
      return invoice.lines?.find((line) => line.id === lineItemId);
    },
  });
}
