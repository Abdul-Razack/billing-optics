import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { Invoice } from '../../../core/api/types';

interface UpdateQtyPayload {
  invoiceId: string;
  itemId: string;
  qty: number;
}

export function useUpdateInvoiceItemQty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_payload: UpdateQtyPayload) => {
      return { success: true };
    },
    onMutate: async (payload) => {
      const queryKey = invoiceQueryKeys.detail(payload.invoiceId);
      await queryClient.cancelQueries({ queryKey });

      const previousInvoice = queryClient.getQueryData<Invoice>(queryKey);

      if (previousInvoice) {
        let diff = 0;
        const updatedLines = previousInvoice.lines?.map(l => {
          if (l.id === payload.itemId) {
            const oldSubtotal = l.subtotal;
            const newSubtotal = payload.qty * l.unitPrice;
            diff = newSubtotal - oldSubtotal;
            return { ...l, quantity: payload.qty, subtotal: newSubtotal };
          }
          return l;
        }) || [];

        const updatedInvoice: Invoice = {
          ...previousInvoice,
          lines: updatedLines,
          total: (previousInvoice.total || 0) + diff,
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
