import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';
import { Invoice } from '../../../core/api/types';

interface RemoveItemPayload {
  invoiceId: string;
  itemId: string;
}

export function useRemoveInvoiceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_payload: RemoveItemPayload) => {
      // Local only
      return { success: true };
    },
    onMutate: async (payload) => {
      const queryKey = invoiceQueryKeys.detail(payload.invoiceId);
      await queryClient.cancelQueries({ queryKey });

      const previousInvoice = queryClient.getQueryData<Invoice>(queryKey);

      if (previousInvoice) {
        const itemToRemove = previousInvoice.lines?.find(l => l.id === payload.itemId);
        const updatedInvoice: Invoice = {
          ...previousInvoice,
          lineItemIds: previousInvoice.lineItemIds.filter(id => id !== payload.itemId),
          lines: previousInvoice.lines?.filter(l => l.id !== payload.itemId) || [],
          total: (previousInvoice.total || 0) - (itemToRemove?.subtotal || 0),
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
