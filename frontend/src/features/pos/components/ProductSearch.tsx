/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSearchStore } from '../store/search.store';
import { useProducts } from '../../inventory/hooks/useProducts';
import { useAddInvoiceItem } from '../hooks/useAddInvoiceItem';
import { usePosStore } from '../store/usePosStore';
import ProductRow from './ProductRow';

export default function ProductSearch(): JSX.Element {
  const { search, highlightedIndex, isSearchFocused, setSearch, setHighlightedIndex, setSearchFocused } = useSearchStore();
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const { mutate: addItem } = useAddInvoiceItem();

  const [inputValue, setInputValue] = useState(search);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 150);
    return () => clearTimeout(handler);
  }, [inputValue, setSearch]);

  const { data: products = [], isLoading } = useProducts(search);

  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchFocused || products.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(Math.min(highlightedIndex + 1, products.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(Math.max(highlightedIndex - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = products[highlightedIndex];
        if (selected && activeInvoiceId) {
          addItem({ invoiceId: activeInvoiceId, productId: selected.id, qty: 1, unitPrice: selected.sellingPrice });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused, products, highlightedIndex, activeInvoiceId, setHighlightedIndex, addItem]);

  useEffect(() => {
    if (products.length > 0) {
      rowVirtualizer.scrollToIndex(highlightedIndex);
    }
  }, [highlightedIndex, rowVirtualizer, products.length]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Products</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
      
      {isLoading && (
        <div className="p-4 flex justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
          </div>
        </div>
      )}

      <div
        ref={parentRef}
        className="flex-1 overflow-auto relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const product = products[virtualItem.index];
            if (!product) return null;
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
                <ProductRow 
                  product={product} 
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
