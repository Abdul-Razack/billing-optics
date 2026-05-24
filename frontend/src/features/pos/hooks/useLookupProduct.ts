import { useMutation } from '@tanstack/react-query';
import { Product } from '../../../core/api/types';
import { useAddInvoiceItem } from './useAddInvoiceItem';
import { usePosStore } from '../store/usePosStore';

export function useLookupProduct() {
  const { mutate: addItem } = useAddInvoiceItem();
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);

  return useMutation({
    mutationFn: async (barcode: string): Promise<Product> => {
      const response = await fetch(`/api/inventory/products/lookup?barcode=${encodeURIComponent(barcode)}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
    onSuccess: (product) => {
      if (activeInvoiceId) {
        addItem({ invoiceId: activeInvoiceId, productId: product.id, qty: 1 });
      }
    },
  });
}
