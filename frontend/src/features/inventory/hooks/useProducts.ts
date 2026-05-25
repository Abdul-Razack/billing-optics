/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQuery } from '@tanstack/react-query';
import { Product } from '../../../core/api/types';
import { apiClient } from '../../../core/api/client';

export const productQueryKeys = {
  search: (search: string) => ['products', 'search', search] as const,
};

export function useProducts(search: string) {
  return useQuery({
    queryKey: productQueryKeys.search(search),
    queryFn: async (): Promise<Product[]> => {
      const response = await apiClient.get(`/products?search=${encodeURIComponent(search)}`);
      return response.data;
    },
    enabled: true,
  });
}
