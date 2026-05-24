import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerQueryKeys, Customer } from '../hooks/useCustomerSearch';
import { useLinkCustomer } from '../../pos/hooks/useLinkCustomer';
import { usePosStore } from '../../pos/store/usePosStore';
import { useRenderTracker } from '../../../core/performance/render-tracker';
import { memoizeSelector } from '../../../core/performance/selector-utils';

interface CustomerRowProps {
  customerId: string;
  search: string;
  isHighlighted: boolean;
}

function CustomerRow({ customerId, search, isHighlighted }: CustomerRowProps): JSX.Element {
  useRenderTracker('CustomerRow');
  
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { mutate: linkCustomer } = useLinkCustomer();

  const selectCustomer = useCallback(
    memoizeSelector((customers: Customer[]) => customers.find((c) => c.id === customerId)),
    [customerId]
  );

  const { data: customer } = useQuery({
    queryKey: customerQueryKeys.search(search),
    queryFn: async (): Promise<Customer[]> => {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
    select: selectCustomer,
  });

  const handleClick = useCallback(() => {
    if (activeInvoiceId) {
      linkCustomer({ invoiceId: activeInvoiceId, customerId });
    }
  }, [activeInvoiceId, customerId, linkCustomer]);

  if (!customer) return <div style={{ height: '40px' }}>Loading...</div>;

  return (
    <div
      onClick={handleClick}
      className={`customer-row ${isHighlighted ? 'highlighted' : ''}`}
      style={{
        backgroundColor: isHighlighted ? '#e2e8f0' : 'transparent',
        height: '40px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid #cbd5e1',
        boxSizing: 'border-box',
      }}
    >
      <strong>{customer.name}</strong>
      <span>{customer.phone}</span>
    </div>
  );
}

export default React.memo(CustomerRow);
