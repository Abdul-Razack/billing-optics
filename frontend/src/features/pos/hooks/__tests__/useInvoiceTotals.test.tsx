import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useInvoiceTotals } from '../useInvoiceTotals';

// Mock the API client
vi.mock('../../../../core/api/client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({
      data: {
        id: '123',
        lines: [
          { unitPrice: 1000, quantity: 2 }, // 2000
          { unitPrice: 500, quantity: 1 }   // 500
        ],
        payments: [
          { amount: 1000 }
        ]
      }
    })
  }
}));

describe('useInvoiceTotals', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('calculates totals correctly from API response', async () => {
    const { result } = renderHook(() => useInvoiceTotals('123'), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    const totals = result.current.data;
    
    expect(totals?.subtotal).toBe(2500);
    expect(totals?.tax).toBe(250); // 10%
    expect(totals?.grandTotal).toBe(2750);
    expect(totals?.paidAmount).toBe(1000);
    expect(totals?.balanceAmount).toBe(1750);
  });
});
