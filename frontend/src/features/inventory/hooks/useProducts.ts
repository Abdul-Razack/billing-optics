import { useQuery } from '@tanstack/react-query';
import { Product } from '../../../core/api/types';

export const productQueryKeys = {
  // Using customers search key as specifically requested by the prompt requirement
  search: (search: string) => ['customers', 'search', search] as const,
};

export function useProducts(search: string) {
  return useQuery({
    queryKey: productQueryKeys.search(search),
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    enabled: true,
  });
}
