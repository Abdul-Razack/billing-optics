/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCustomerSearch } from '../hooks/useCustomerSearch';
import { useLinkCustomer } from '../../pos/hooks/useLinkCustomer';
import { usePosStore } from '../../pos/store/usePosStore';
import CustomerRow from './CustomerRow';
import CustomerFormModal from './CustomerFormModal';

export default function CustomerSearch(): JSX.Element {
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { mutate: linkCustomer } = useLinkCustomer();

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setHighlightedIndex(0);
    }, 200);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const { data: customers = [], isLoading } = useCustomerSearch(debouncedSearch);

  const rowVirtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused || customers.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, customers.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = customers[highlightedIndex];
        if (selected && activeInvoiceId) {
          linkCustomer({ invoiceId: activeInvoiceId, customerId: selected.id });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, customers, highlightedIndex, activeInvoiceId, linkCustomer]);

  useEffect(() => {
    if (customers.length > 0) {
      rowVirtualizer.scrollToIndex(highlightedIndex);
    }
  }, [highlightedIndex, rowVirtualizer, customers.length]);

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Customer Link</h2>
        <input
          type="text"
          placeholder="Search customers..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
        />
      </div>
      
      {isLoading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center p-2 space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div className="flex flex-col space-y-2 w-1/2">
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-2 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : customers.length === 0 && debouncedSearch ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">No customers found</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700"
          >
            + Create New Customer
          </button>
        </div>
      ) : (

      <div
        ref={parentRef}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const customer = customers[virtualItem.index];
            if (!customer) return null;
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <CustomerRow 
                  customer={customer} 
                  isHighlighted={highlightedIndex === virtualItem.index} 
                />
              </div>
            );
          })}
        </div>
      </div>
      )}

      <CustomerFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialName={debouncedSearch}
        onSuccess={(newCustomerId) => {
          if (activeInvoiceId) {
            linkCustomer({ invoiceId: activeInvoiceId, customerId: newCustomerId.toString() });
          }
        }}
      />
    </div>
  );
}
