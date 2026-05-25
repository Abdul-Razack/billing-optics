/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PrescriptionFormValues } from '../schemas/prescription.schema';
import { apiClient } from '../../../core/api/client';

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

      const response = await apiClient.post(`/customers/${payload.customerId}/prescriptions`, payload.data);
      return response.data;
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
