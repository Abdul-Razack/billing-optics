/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePaymentStore } from '../../../core/store/payment.store';
import { useInvoiceTotals } from '../../pos/hooks/useInvoiceTotals';
import { usePosStore } from '../../pos/store/usePosStore';
import { useCheckoutInvoice } from '../hooks/useCheckoutInvoice';
import { useInvoice, invoiceQueryKeys } from '../../pos/hooks/useInvoice';
import { queryClient } from '../../../app/providers';
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
  
  const { data: totals } = useInvoiceTotals(activeInvoiceId || '');
  const { data: invoice } = useInvoice(activeInvoiceId || '');
  const { mutate: checkout, isPending } = useCheckoutInvoice();

  const totalSplit = splitPayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  const isInvalid = !totals ? true : (
    (activeMethod === 'SPLIT' && Math.abs(totalSplit - (totals.balanceAmount / 100)) > 0.01) ||
    (activeMethod === 'CASH' && (parseFloat(enteredCash) || 0) < (totals.balanceAmount / 100))
  );

  const handleConfirm = () => {
    if (isInvalid || isPending || !totals || !invoice || !activeInvoiceId) return;
    let payments: any[] = [];
    if (activeMethod === 'CASH') {
      payments.push({ method: 'CASH', amount: totals.grandTotal, reference: '' });
    } else if (activeMethod === 'CARD' || activeMethod === 'UPI') {
      payments.push({ method: activeMethod, amount: totals.grandTotal, reference });
    } else if (activeMethod === 'SPLIT') {
      payments = splitPayments.map((p) => ({ method: p.method, amount: Math.round((parseFloat(p.amount) || 0) * 100), reference: '' }));
    }

    const items = invoice.lines?.map((line: any) => ({
      productId: parseInt(line.productId, 10) || line.productId, // Handle string or number IDs depending on DB
      quantity: line.quantity
    })) || [];

    checkout(
      { 
        invoiceId: activeInvoiceId, 
        payments,
        items,
        customerId: invoice.customerId ? parseInt(invoice.customerId, 10) || undefined : undefined
      },
      {
        onSuccess: () => {
          const updatedInvoice = queryClient.getQueryData<any>(invoiceQueryKeys.detail(activeInvoiceId));
          printReceipt(updatedInvoice || invoice);
          setActiveInvoiceId(`INV-${crypto.randomUUID()}`);
          reset();
        },
      }
    );
  };

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
  }, [isOpen, activeMethod, enteredCash, reference, splitPayments, isInvalid, isPending, totals, invoice, activeInvoiceId]);

  if (!isOpen || !activeInvoiceId || !totals || !invoice) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: '600px', backgroundColor: 'white', borderRadius: '8px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 16px 0' }}>Complete Payment</h2>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Balance: ${(totals.balanceAmount / 100).toFixed(2)}</div>
        
        <PaymentMethodTabs />
        
        <div style={{ marginTop: '16px', minHeight: '200px' }}>
          {activeMethod === 'CASH' && <CashPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
          {activeMethod === 'CARD' && <CardPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
          {activeMethod === 'UPI' && <UpiPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
          {activeMethod === 'SPLIT' && <SplitPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
        </div>
        
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button onClick={() => setIsOpen(false)} style={{ padding: '12px 24px', cursor: 'pointer' }}>Cancel (ESC)</button>
          <button 
            onClick={handleConfirm} 
            disabled={isInvalid || isPending}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: isInvalid || isPending ? '#94a3b8' : '#3b82f6', 
              color: 'white', 
              cursor: isInvalid || isPending ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px'
            }}
          >
            {isPending ? 'Processing...' : 'Confirm (CTRL+ENTER)'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
