/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/client';

export const invoiceQueryKeys = {
  detail: (id: string) => ['invoices', 'detail', id] as const,
};

export function useInvoice(invoiceId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['invoices', 'detail', invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      if (invoiceId.startsWith('INV-')) {
        const existingData = queryClient.getQueryData(['invoices', 'detail', invoiceId]);
        if (existingData) return existingData;
        return { id: invoiceId, customerId: null, total: 0, lineItemIds: [], lines: [] };
      }
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    },
  });
}
