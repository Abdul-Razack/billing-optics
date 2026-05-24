import { useQuery } from '@tanstack/react-query';
import { InventoryStock } from '../../../core/api/types';

export const inventoryQueryKeys = {
  stock: (productId: string) => ['inventory', 'stock', productId] as const,
};

export function useInventoryStock(productId: string) {
  return useQuery({
    queryKey: inventoryQueryKeys.stock(productId),
    queryFn: async (): Promise<InventoryStock> => {
      const response = await fetch(`/api/inventory/stock/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch inventory stock');
      return response.json();
    },
    enabled: !!productId,
  });
}
