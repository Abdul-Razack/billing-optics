/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from './useInvoice';

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

      return { success: true };
    },
    onMutate: async (payload) => {
      const queryKey = invoiceQueryKeys.detail(payload.invoiceId);
      await queryClient.cancelQueries({ queryKey });

      const previousInvoice = queryClient.getQueryData<any>(queryKey);

      if (previousInvoice) {
        queryClient.setQueryData(queryKey, {
          ...previousInvoice,
          customerId: payload.customerId,
        });
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
