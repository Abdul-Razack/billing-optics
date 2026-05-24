import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoiceQueryKeys } from '../hooks/useInvoice';
import { useRenderTracker } from '../../../core/performance/render-tracker';
import { memoizeSelector } from '../../../core/performance/selector-utils';

interface CartLineItemProps {
  invoiceId: string;
  itemId: string;
}

function CartLineItem({ invoiceId, itemId }: CartLineItemProps): JSX.Element {
  useRenderTracker('CartLineItem');
  
  const selectItem = useCallback(
    memoizeSelector((invoice: any) => invoice.lines?.find((i: any) => i.id === itemId)),
    [itemId]
  );

  const { data: item } = useQuery({
    queryKey: invoiceQueryKeys.detail(invoiceId),
    select: selectItem,
  });

  if (!item) return <div style={{ height: '40px' }}>Loading item...</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
      <div>
        <strong>{item.productId}</strong> x {item.quantity}
      </div>
      <div>
        ${(item.unitPrice * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}

export default React.memo(CartLineItem);
