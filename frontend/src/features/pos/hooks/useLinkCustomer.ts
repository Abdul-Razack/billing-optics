import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { Invoice } from '../../../core/api/types';

interface LinkCustomerPayload {
  invoiceId: string;
  customerId: string;
}

export function useLinkCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LinkCustomerPayload) => {
      if (!navigator.onLine) {
        import('../../../core/queue/mutation.queue').then(({ mutationQueue }) => {
          mutationQueue.enqueue('linkCustomer', payload);
        });
        return { success: true, queued: true };
      }

      const response = await fetch(`/api/invoices/${payload.invoiceId}/customer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: payload.customerId }),
      });
      if (!response.ok) throw new Error('Failed to link customer');
      return response.json();
    },
    onMutate: async (payload) => {
      const queryKey = invoiceQueryKeys.detail(payload.invoiceId);
      await queryClient.cancelQueries({ queryKey });

      const previousInvoice = queryClient.getQueryData<Invoice>(queryKey);

      if (previousInvoice) {
        const updatedInvoice: Invoice = {
          ...previousInvoice,
          customerId: payload.customerId,
        };
        queryClient.setQueryData<Invoice>(queryKey, updatedInvoice);
      }

      return { previousInvoice, queryKey };
    },
    onError: (_err, _payload, context) => {
      if (context?.previousInvoice) {
        queryClient.setQueryData(context.queryKey, context.previousInvoice);
      }
    },
    onSettled: (_data, _error, payload) => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.detail(payload.invoiceId) });
    },
  });
}
