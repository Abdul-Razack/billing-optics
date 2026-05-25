import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/client';
import { Customer } from './useCustomerSearch';
import { toast } from 'react-hot-toast';

interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCustomerPayload) => {
      if (!navigator.onLine) {
        throw new Error('Cannot create customer while offline. Offline queueing not yet implemented for customer creation.');
      }
      const response = await apiClient.post('/customers', payload);
      return response.data as Customer;
    },
    onSuccess: (newCustomer) => {
      // Invalidate customer search cache so the new customer appears
      queryClient.invalidateQueries({ queryKey: ['customers', 'search'] });
      toast.success('Customer created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to create customer');
    }
  });
}
