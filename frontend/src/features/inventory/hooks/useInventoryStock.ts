/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useQuery } from '@tanstack/react-query';
import { InventoryStock } from '../../../core/api/types';
import { apiClient } from '../../../core/api/client';

export const inventoryQueryKeys = {
  stock: (productId: string) => ['inventory', 'stock', productId] as const,
};

export function useInventoryStock(productId: string) {
  return useQuery({
    queryKey: inventoryQueryKeys.stock(productId),
    queryFn: async (): Promise<InventoryStock> => {
      const response = await apiClient.get(`/inventory/stock/${productId}`);
      return response.data;
    },
    enabled: !!productId,
  });
}
