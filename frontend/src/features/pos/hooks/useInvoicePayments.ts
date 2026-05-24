import { useQuery } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { InvoicePayment } from '../../../core/api/payment.types';
import { Invoice } from '../../../core/api/types';

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    select: (invoice: Invoice): InvoicePayment[] => invoice.payments || [],
  });
}
