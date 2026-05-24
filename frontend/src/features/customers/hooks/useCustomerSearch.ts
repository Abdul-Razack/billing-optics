import { useQuery } from '@tanstack/react-query';

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export const customerQueryKeys = {
  search: (search: string) => ['customers', 'search', search] as const,
};

export function useCustomerSearch(search: string) {
  return useQuery({
    queryKey: customerQueryKeys.search(search),
    queryFn: async (): Promise<Customer[]> => {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
    enabled: true,
  });
}
