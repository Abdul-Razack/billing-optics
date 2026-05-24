import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productQueryKeys } from '../../inventory/hooks/useProducts';
import { useSearchStore } from '../store/search.store';
import { Product } from '../../../core/api/types';
import StockBadge from '../../inventory/components/StockBadge';
import { useAddInvoiceItem } from '../hooks/useAddInvoiceItem';
import { usePosStore } from '../store/usePosStore';
import { useRenderTracker } from '../../../core/performance/render-tracker';
import { memoizeSelector } from '../../../core/performance/selector-utils';

interface ProductRowProps {
  productId: string;
}

function ProductRow({ productId }: ProductRowProps): JSX.Element {
  useRenderTracker('ProductRow');
  
  const search = useSearchStore((state) => state.search);
  const highlightedIndex = useSearchStore((state) => state.highlightedIndex);
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { mutate: addItem } = useAddInvoiceItem();

  const selectProduct = useCallback(
    memoizeSelector((products: Product[]) => products.find((p) => p.id === productId)),
    [productId]
  );

  const { data: product } = useQuery({
    queryKey: productQueryKeys.search(search),
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    select: selectProduct,
  });

  const selectIsHighlighted = useCallback(
    memoizeSelector((products: Product[]) => products.findIndex((p) => p.id === productId) === highlightedIndex),
    [productId, highlightedIndex]
  );

  const { data: isHighlighted } = useQuery({
    queryKey: productQueryKeys.search(search),
    queryFn: async (): Promise<Product[]> => {
      const response = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    select: selectIsHighlighted,
  });

  const handleClick = useCallback(() => {
    if (activeInvoiceId) {
      addItem({ invoiceId: activeInvoiceId, productId, qty: 1 });
    }
  }, [activeInvoiceId, productId, addItem]);

  if (!product) return <div style={{ height: '50px' }}>Loading...</div>;

  return (
    <div
      onClick={handleClick}
      className={`product-row ${isHighlighted ? 'highlighted' : ''}`}
      style={{
        backgroundColor: isHighlighted ? '#e2e8f0' : 'transparent',
        height: '50px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid #cbd5e1',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <strong>{product.name}</strong>
        <span style={{ marginLeft: '8px', color: '#64748b' }}>{product.sku}</span>
      </div>
      <div>
        <span style={{ marginRight: '16px' }}>${product.sellingPrice.toFixed(2)}</span>
        <StockBadge productId={product.id} />
      </div>
    </div>
  );
}

export default React.memo(ProductRow);
