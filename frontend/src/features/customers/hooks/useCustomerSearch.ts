/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/client';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
}

export const customerQueryKeys = {
  search: (search: string) => ['customers', 'search', search] as const,
};

export function useCustomerSearch(search: string) {
  return useQuery({
    queryKey: customerQueryKeys.search(search),
    queryFn: async (): Promise<Customer[]> => {
      const response = await apiClient.get(`/customers?search=${encodeURIComponent(search)}`);
      return response.data;
    },
    enabled: true,
  });
}
