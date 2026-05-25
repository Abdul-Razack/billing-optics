import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SplitPaymentPanel from '../SplitPaymentPanel';
import { usePaymentStore } from '../../../../core/store/payment.store';

// Mock Zustand store
vi.mock('../../../../core/store/payment.store', () => ({
  usePaymentStore: vi.fn(),
}));

describe('SplitPaymentPanel', () => {
  let mockUpdateSplitPayment: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUpdateSplitPayment = vi.fn();
    (usePaymentStore as any).mockReturnValue({
      splitPayments: [
        { method: 'CASH', amount: '500' },
        { method: 'CARD', amount: '1000' }
      ],
      updateSplitPayment: mockUpdateSplitPayment,
    });
  });

  it('calculates remaining balance correctly', () => {
    render(<SplitPaymentPanel balanceAmount={2000} />);
    
    // totalSplit is 1500, balance is 2000, remaining should be 500
    expect(screen.getByText('Remaining: $500.00')).toBeInTheDocument();
  });

  it('updates split payment when input changes', () => {
    render(<SplitPaymentPanel balanceAmount={2000} />);
    
    const inputs = screen.getAllByPlaceholderText('Amount');
    expect(inputs).toHaveLength(2);

    fireEvent.change(inputs[0], { target: { value: '600' } });
    
    expect(mockUpdateSplitPayment).toHaveBeenCalledWith(0, '600');
  });

  it('shows green text when remaining is zero', () => {
    render(<SplitPaymentPanel balanceAmount={1500} />); // 500 + 1000 = 1500
    
    const remainingText = screen.getByText('Remaining: $0.00');
    expect(remainingText).toHaveStyle({ color: 'rgb(34, 197, 94)' }); // #22c55e
  });
});
