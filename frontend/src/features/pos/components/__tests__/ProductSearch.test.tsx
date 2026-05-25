import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ProductSearch from '../ProductSearch';
import { useSearchStore } from '../../store/search.store';
import { usePosStore } from '../../store/usePosStore';
import { useProducts } from '../../../inventory/hooks/useProducts';
import { useAddInvoiceItem } from '../../hooks/useAddInvoiceItem';

// Mock the dependencies
vi.mock('../../store/search.store', () => ({
  useSearchStore: vi.fn(),
}));

vi.mock('../../store/usePosStore', () => ({
  usePosStore: vi.fn(),
}));

vi.mock('../../../inventory/hooks/useProducts', () => ({
  useProducts: vi.fn(),
}));

vi.mock('../../hooks/useAddInvoiceItem', () => ({
  useAddInvoiceItem: vi.fn(),
}));

// Mock react-virtual
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [
      { index: 0, key: 0, size: 50, start: 0 }
    ],
    getTotalSize: () => 50,
    scrollToIndex: vi.fn(),
  }),
}));

// Mock ProductRow since it's a child component
vi.mock('../ProductRow', () => ({
  default: ({ product }: any) => <div data-testid="product-row">{product.name}</div>
}));

describe('ProductSearch', () => {
  let mockSetSearch: ReturnType<typeof vi.fn>;
  let mockAddItem: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetSearch = vi.fn();
    mockAddItem = vi.fn();

    (useSearchStore as any).mockReturnValue({
      search: '',
      highlightedIndex: 0,
      isSearchFocused: true,
      setSearch: mockSetSearch,
      setHighlightedIndex: vi.fn(),
      setSearchFocused: vi.fn(),
    });

    (usePosStore as any).mockReturnValue('inv-123'); // activeInvoiceId

    (useProducts as any).mockReturnValue({
      data: [{ id: 'p1', name: 'Test Frame', sellingPrice: 5000 }],
      isLoading: false,
    });

    (useAddInvoiceItem as any).mockReturnValue({
      mutate: mockAddItem,
    });
  });

  it('renders input and product list', () => {
    render(<ProductSearch />);
    
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByTestId('product-row')).toHaveTextContent('Test Frame');
  });

  it('debounces search input and updates store', async () => {
    render(<ProductSearch />);
    
    const input = screen.getByPlaceholderText('Search products...');
    fireEvent.change(input, { target: { value: 'Rayban' } });
    
    // Should not be called immediately due to 150ms debounce
    expect(mockSetSearch).not.toHaveBeenCalledWith('Rayban');
    
    await waitFor(() => {
      expect(mockSetSearch).toHaveBeenCalledWith('Rayban');
    });
  });

  it('triggers addItem when Enter is pressed on highlighted item', () => {
    render(<ProductSearch />);
    
    fireEvent.keyDown(window, { key: 'Enter' });
    
    expect(mockAddItem).toHaveBeenCalledWith({
      invoiceId: 'inv-123',
      productId: 'p1',
      qty: 1,
      unitPrice: 5000,
    });
  });
});
