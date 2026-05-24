import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCustomerSearch } from '../hooks/useCustomerSearch';
import { useLinkCustomer } from '../../pos/hooks/useLinkCustomer';
import { usePosStore } from '../../pos/store/usePosStore';
import CustomerRow from './CustomerRow';

export default function CustomerSearch(): JSX.Element {
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { mutate: linkCustomer } = useLinkCustomer();

  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

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
    <div className="customer-search" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <input
        type="text"
        placeholder="Search customers..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ padding: '8px', margin: '8px' }}
      />
      
      {isLoading && <div style={{ padding: '8px' }}>Loading...</div>}

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
                  customerId={customer.id} 
                  search={debouncedSearch} 
                  isHighlighted={highlightedIndex === virtualItem.index} 
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
