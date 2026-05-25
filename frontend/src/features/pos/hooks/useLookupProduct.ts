/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useMutation } from '@tanstack/react-query';
import { Product } from '../../../core/api/types';
import { useAddInvoiceItem } from './useAddInvoiceItem';
import { usePosStore } from '../store/usePosStore';
import { apiClient } from '../../../core/api/client';

export function useLookupProduct() {
  const { mutate: addItem } = useAddInvoiceItem();
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);

  return useMutation({
    mutationFn: async (barcode: string): Promise<Product> => {
      const response = await apiClient.get(`/inventory/products/lookup?barcode=${encodeURIComponent(barcode)}`);
      return response.data;
    },
    onSuccess: (product) => {
      if (activeInvoiceId) {
        addItem({ invoiceId: activeInvoiceId, productId: product.id, qty: 1, unitPrice: product.sellingPrice });
      }
    },
  });
}
