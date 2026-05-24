import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { Invoice, InvoiceLine } from '../../../core/api/types';

interface AddItemPayload {
  invoiceId: string;
  productId: string;
  qty: number;
}

export function useAddInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddItemPayload) => {
      if (!navigator.onLine) {
        import('../../../core/queue/mutation.queue').then(({ mutationQueue }) => {
          mutationQueue.enqueue('addInvoiceItem', payload);
        });
        return { success: true, queued: true };
      }

      const response = await fetch(`/api/invoices/${payload.invoiceId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: payload.productId, qty: payload.qty }),
      });
      if (!response.ok) throw new Error('Failed to add item');
      return response.json();
    },
    onMutate: async (payload) => {
      const queryKey = invoiceQueryKeys.detail(payload.invoiceId);
      await queryClient.cancelQueries({ queryKey });

      const previousInvoice = queryClient.getQueryData<Invoice>(queryKey);

      if (previousInvoice) {
        const tempId = `temp-${Date.now()}`;
        const newInvoiceLine: InvoiceLine = {
          id: tempId,
          productId: payload.productId,
          quantity: payload.qty,
          unitPrice: 0,
          subtotal: 0,
        };

        const updatedInvoice: Invoice = {
          ...previousInvoice,
          lineItemIds: [...previousInvoice.lineItemIds, tempId],
          lines: [...(previousInvoice.lines || []), newInvoiceLine],
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
