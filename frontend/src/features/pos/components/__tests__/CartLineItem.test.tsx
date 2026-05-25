import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CartLineItem from '../CartLineItem';
import { useRemoveInvoiceItem } from '../../hooks/useRemoveInvoiceItem';
import { useUpdateInvoiceItemQty } from '../../hooks/useUpdateInvoiceItemQty';
import { useQuery } from '@tanstack/react-query';

// Mock the hooks
vi.mock('../../hooks/useRemoveInvoiceItem', () => ({
  useRemoveInvoiceItem: vi.fn()
}));

vi.mock('../../hooks/useUpdateInvoiceItemQty', () => ({
  useUpdateInvoiceItemQty: vi.fn()
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query') as any;
  return {
    ...actual,
    useQuery: vi.fn()
  };
});

describe('CartLineItem', () => {
  let mockRemove: ReturnType<typeof vi.fn>;
  let mockUpdateQty: ReturnType<typeof vi.fn>;
  
  const queryClient = new QueryClient();

  beforeEach(() => {
    mockRemove = vi.fn();
    mockUpdateQty = vi.fn();

    (useRemoveInvoiceItem as any).mockReturnValue({ mutate: mockRemove });
    (useUpdateInvoiceItemQty as any).mockReturnValue({ mutate: mockUpdateQty });

    (useQuery as any).mockReturnValue({
      data: {
        id: 'item-1',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 15000 // $150.00
      }
    });
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient}>
      <CartLineItem invoiceId="inv-1" itemId="item-1" />
    </QueryClientProvider>
  );

  it('renders correctly with given item data', () => {
    renderComponent();
    expect(screen.getByText('prod-1')).toBeInTheDocument();
    expect(screen.getByText('$150.00 × 2')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument(); // total = 15000 * 2 / 100
  });

  it('calls updateQty when + button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('+'));
    expect(mockUpdateQty).toHaveBeenCalledWith({ invoiceId: 'inv-1', itemId: 'item-1', qty: 3 });
  });

  it('calls updateQty when - button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('-'));
    expect(mockUpdateQty).toHaveBeenCalledWith({ invoiceId: 'inv-1', itemId: 'item-1', qty: 1 });
  });

  it('calls removeItem when trash button is clicked', () => {
    renderComponent();
    const trashButton = screen.getByTitle('Remove Item');
    fireEvent.click(trashButton);
    expect(mockRemove).toHaveBeenCalledWith({ invoiceId: 'inv-1', itemId: 'item-1' });
  });
});
