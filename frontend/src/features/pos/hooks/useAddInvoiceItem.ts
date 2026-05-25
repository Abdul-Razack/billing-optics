/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { Invoice, InvoiceLine } from '../../../core/api/types';

interface AddItemPayload {
  invoiceId: string;
  productId: string;
  qty: number;
  unitPrice: number;
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

      return { success: true };
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
          unitPrice: payload.unitPrice,
          subtotal: payload.qty * payload.unitPrice,
        };

        const updatedInvoice: Invoice = {
          ...previousInvoice,
          lineItemIds: [...previousInvoice.lineItemIds, tempId],
          lines: [...(previousInvoice.lines || []), newInvoiceLine],
          total: (previousInvoice.total || 0) + newInvoiceLine.subtotal,
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
  });
}
