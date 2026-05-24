import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PrescriptionFormValues } from '../schemas/prescription.schema';

export const prescriptionQueryKeys = {
  patient: (customerId: string) => ['prescriptions', 'patient', customerId] as const,
};

interface SavePrescriptionPayload {
  customerId: string;
  data: PrescriptionFormValues;
}

export function useSavePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SavePrescriptionPayload) => {
      if (!navigator.onLine) {
        import('../../../core/queue/mutation.queue').then(({ mutationQueue }) => {
          mutationQueue.enqueue('savePrescription', payload);
        });
        return { success: true, queued: true };
      }

      const response = await fetch(`/api/customers/${payload.customerId}/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.data),
      });
      if (!response.ok) throw new Error('Failed to save prescription');
      return response.json();
    },
    onMutate: async (payload) => {
      const queryKey = prescriptionQueryKeys.patient(payload.customerId);
      await queryClient.cancelQueries({ queryKey });

      const previousPrescriptions = queryClient.getQueryData<PrescriptionFormValues[]>(queryKey);

      if (previousPrescriptions) {
        queryClient.setQueryData<PrescriptionFormValues[]>(queryKey, [
          ...previousPrescriptions,
          payload.data,
        ]);
      } else {
        queryClient.setQueryData<PrescriptionFormValues[]>(queryKey, [payload.data]);
      }

      return { previousPrescriptions, queryKey };
    },
    onError: (_err, _payload, context) => {
      if (context?.previousPrescriptions) {
        queryClient.setQueryData(context.queryKey, context.previousPrescriptions);
      }
    },
    onSettled: (_data, _error, payload) => {
      queryClient.invalidateQueries({ queryKey: prescriptionQueryKeys.patient(payload.customerId) });
    },
  });
}
