/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQuery } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { InvoicePayment } from '../../../core/api/payment.types';
import { Invoice } from '../../../core/api/types';

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    queryFn: async (): Promise<Invoice> => {
      const { apiClient } = await import('../../../core/api/client');
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    },
    select: (invoice: Invoice): InvoicePayment[] => invoice.payments || [],
  });
}
