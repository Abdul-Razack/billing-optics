/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import React, { useCallback } from 'react';
import { Customer } from '../hooks/useCustomerSearch';
import { useLinkCustomer } from '../../pos/hooks/useLinkCustomer';
import { usePosStore } from '../../pos/store/usePosStore';
import { useRenderTracker } from '../../../core/performance/render-tracker';

interface CustomerRowProps {
  customer: Customer;
  isHighlighted: boolean;
}

function CustomerRow({ customer, isHighlighted }: CustomerRowProps): JSX.Element {
  useRenderTracker('CustomerRow');
  
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { mutate: linkCustomer } = useLinkCustomer();

  const handleClick = useCallback(() => {
    if (activeInvoiceId) {
      linkCustomer({ invoiceId: activeInvoiceId, customerId: customer.id });
    }
  }, [activeInvoiceId, customer.id, linkCustomer]);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-slate-100 transition-colors duration-150 ease-in-out ${
        isHighlighted ? 'bg-indigo-50/70 border-indigo-100' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex flex-col">
        <span className="font-semibold text-slate-800 text-sm">{customer.fullName}</span>
        <span className="text-xs text-slate-500 font-medium mt-0.5">{customer.phone}</span>
      </div>
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

export default React.memo(CustomerRow);
