import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from '../../pos/hooks/useInvoice';
import { InvoicePayment } from '../../../core/api/payment.types';
import { mutationQueue } from '../../../core/queue/mutation.queue';

interface CheckoutPayload {
  invoiceId: string;
  payments: Omit<InvoicePayment, 'id' | 'invoiceId' | 'createdAt'>[];
}

export function useCheckoutInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      if (!navigator.onLine) {
        await mutationQueue.enqueue('checkoutInvoice', payload);
        return { success: true, queued: true };
      }

      const response = await fetch(`/api/invoices/${payload.invoiceId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Checkout failed');
      return response.json();
    },
    onMutate: async (payload) => {
      const queryKey = invoiceQueryKeys.detail(payload.invoiceId);
      await queryClient.cancelQueries({ queryKey });

      const previousInvoice = queryClient.getQueryData<any>(queryKey);

      if (previousInvoice) {
        queryClient.setQueryData(queryKey, {
          ...previousInvoice,
          status: 'PAID',
          payments: payload.payments.map((p, i) => ({
            ...p,
            id: `temp-${i}`,
            invoiceId: payload.invoiceId,
            createdAt: new Date().toISOString(),
          })),
        });
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
