/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
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
          toast.success(`Added ${selected.name}`);
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
            autoFocus
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex-1 overflow-hidden p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-2">
              <div className="flex flex-col space-y-2 w-1/2">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <div className="w-16 h-16 mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">No products found</p>
          <p className="text-xs mt-1 text-slate-400">Try adjusting your search terms</p>
        </div>
      ) : (

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
      )}
    </div>
  );
}
