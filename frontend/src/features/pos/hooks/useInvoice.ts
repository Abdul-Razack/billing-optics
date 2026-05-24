import { useQuery } from '@tanstack/react-query';
import { Invoice } from '../../../core/api/types';

export const invoiceQueryKeys = {
  detail: (id: string) => ['invoices', 'detail', id] as const,
};

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ['invoices', 'detail', invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }

      return response.json();
    },
  });
}
