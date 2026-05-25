/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import React, { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from '../hooks/useInvoice';
import { useRenderTracker } from '../../../core/performance/render-tracker';
import { memoizeSelector } from '../../../core/performance/selector-utils';
import { Product } from '../../../core/api/types';
import { useRemoveInvoiceItem } from '../hooks/useRemoveInvoiceItem';
import { useUpdateInvoiceItemQty } from '../hooks/useUpdateInvoiceItemQty';

interface CartLineItemProps {
  invoiceId: string;
  itemId: string;
}

function CartLineItem({ invoiceId, itemId }: CartLineItemProps): JSX.Element {
  useRenderTracker('CartLineItem');
  const queryClient = useQueryClient();
  const { mutate: removeItem } = useRemoveInvoiceItem();
  const { mutate: updateQty } = useUpdateInvoiceItemQty();
  
  const selectItem = useCallback(
    memoizeSelector((invoice: any) => invoice.lines?.find((i: any) => i.id === itemId)),
    [itemId]
  );

  const { data: item } = useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    queryFn: async () => {
      const { apiClient } = await import('../../../core/api/client');
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response.data;
    },
    select: selectItem,
  });

  if (!item) return <div className="h-12 px-4 py-3 flex items-center text-slate-400 text-sm">Loading item...</div>;

  // Retrieve product from cache for name display
  let product: Product | undefined;
  const queries = queryClient.getQueriesData<Product[]>({ queryKey: ['products', 'search'] });
  for (const [, cachedProducts] of queries) {
    product = cachedProducts?.find(p => p.id === item.productId);
    if (product) break;
  }
  const productName = product ? product.name : item.productId;

  const unitPriceFormatted = (item.unitPrice / 100).toFixed(2);
  const totalFormatted = ((item.unitPrice * item.quantity) / 100).toFixed(2);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="flex flex-col">
        <span className="font-semibold text-slate-800 text-sm">{productName}</span>
        <span className="text-xs text-slate-500 mt-0.5">
          ${unitPriceFormatted} × {item.quantity}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-lg p-1">
          <button 
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded transition-all active:scale-90"
            onClick={() => {
              if (item.quantity > 1) updateQty({ invoiceId, itemId, qty: item.quantity - 1 });
            }}
          >
            -
          </button>
          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
          <button 
            className="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded transition-all active:scale-90"
            onClick={() => updateQty({ invoiceId, itemId, qty: item.quantity + 1 })}
          >
            +
          </button>
        </div>
        <div className="font-semibold text-slate-800 w-20 text-right">
          ${totalFormatted}
        </div>
        <button 
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all active:scale-90"
          onClick={() => removeItem({ invoiceId, itemId })}
          title="Remove Item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default React.memo(CartLineItem);
