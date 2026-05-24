import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePaymentStore } from '../../../core/store/payment.store';
import { useInvoiceTotals } from '../../pos/hooks/useInvoiceTotals';
import { usePosStore } from '../../pos/store/usePosStore';
import { useCheckoutInvoice } from '../hooks/useCheckoutInvoice';
import { printReceipt } from '../../receipts/utils/receipt-printer';
import PaymentMethodTabs from './PaymentMethodTabs';
import CashPaymentPanel from './CashPaymentPanel';
import CardPaymentPanel from './CardPaymentPanel';
import UpiPaymentPanel from './UpiPaymentPanel';
import SplitPaymentPanel from './SplitPaymentPanel';

export default function PaymentModal(): JSX.Element | null {
  const { isOpen, setIsOpen, activeMethod, enteredCash, reference, splitPayments, reset } = usePaymentStore();
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const setActiveInvoiceId = usePosStore((state) => state.setActiveInvoiceId);
  
  const { data: totals } = useInvoiceTotals(activeInvoiceId!);
  const { mutate: checkout } = useCheckoutInvoice();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
      if (e.ctrlKey && e.key === 'Enter') {
        handleConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeMethod, enteredCash, reference, splitPayments]);

  if (!isOpen || !activeInvoiceId || !totals) return null;

  const handleConfirm = () => {
    let payments: any[] = [];
    if (activeMethod === 'CASH') {
      payments.push({ method: 'CASH', amount: totals.grandTotal, reference: '' });
    } else if (activeMethod === 'CARD' || activeMethod === 'UPI') {
      payments.push({ method: activeMethod, amount: totals.grandTotal, reference });
    } else if (activeMethod === 'SPLIT') {
      payments = splitPayments.map((p) => ({ method: p.method, amount: parseFloat(p.amount) || 0, reference: '' }));
    }

    checkout(
      { invoiceId: activeInvoiceId, payments },
      {
        onSuccess: () => {
          printReceipt(activeInvoiceId);
          setActiveInvoiceId(crypto.randomUUID());
          reset();
        },
      }
    );
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: '600px', backgroundColor: 'white', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Complete Payment</h2>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Balance: ${totals.balanceAmount.toFixed(2)}</div>
        
        <PaymentMethodTabs />
        
        <div style={{ marginTop: '16px', minHeight: '200px' }}>
          {activeMethod === 'CASH' && <CashPaymentPanel balanceAmount={totals.balanceAmount} />}
          {activeMethod === 'CARD' && <CardPaymentPanel balanceAmount={totals.balanceAmount} />}
          {activeMethod === 'UPI' && <UpiPaymentPanel balanceAmount={totals.balanceAmount} />}
          {activeMethod === 'SPLIT' && <SplitPaymentPanel balanceAmount={totals.balanceAmount} />}
        </div>
        
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button onClick={() => setIsOpen(false)} style={{ padding: '12px 24px', cursor: 'pointer' }}>Cancel (ESC)</button>
          <button onClick={handleConfirm} style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Confirm (CTRL+ENTER)</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
