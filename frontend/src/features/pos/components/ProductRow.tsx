/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import React, { useCallback } from 'react';
import { Product } from '../../../core/api/types';
import StockBadge from '../../inventory/components/StockBadge';
import { useAddInvoiceItem } from '../hooks/useAddInvoiceItem';
import { usePosStore } from '../store/usePosStore';
import { useRenderTracker } from '../../../core/performance/render-tracker';

interface ProductRowProps {
  product: Product;
  isHighlighted: boolean;
}

function ProductRow({ product, isHighlighted }: ProductRowProps): JSX.Element {
  useRenderTracker('ProductRow');
  
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { mutate: addItem } = useAddInvoiceItem();

  const handleClick = useCallback(() => {
    if (activeInvoiceId) {
      addItem({ invoiceId: activeInvoiceId, productId: product.id, qty: 1, unitPrice: product.sellingPrice });
    }
  }, [activeInvoiceId, product.id, product.sellingPrice, addItem]);

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center justify-between px-4 py-3 cursor-pointer border-b border-slate-100 transition-all duration-200 ease-in-out ${
        isHighlighted ? 'bg-indigo-50/70 border-indigo-100 shadow-[inset_2px_0_0_0_#6366f1]' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex flex-col overflow-hidden">
        <span className="font-semibold text-slate-800 text-sm truncate">{product.name}</span>
        <span className="text-xs text-slate-500 font-medium mt-0.5 font-mono">{product.sku}</span>
      </div>
      <div className="flex items-center space-x-4 pl-4 shrink-0">
        <span className="font-semibold text-slate-700">
          ${(product.sellingPrice / 100).toFixed(2)}
        </span>
        <StockBadge productId={product.id} />
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductRow);
