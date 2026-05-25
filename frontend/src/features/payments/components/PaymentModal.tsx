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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[1000] animate-in fade-in duration-200">
      <div className="w-[500px] bg-white rounded-3xl p-6 flex flex-col shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-200 border border-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Complete Payment</h2>
          <div className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full">INV-PENDING</div>
        </div>
        
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 shadow-inner flex flex-col items-center justify-center text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
           <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-16 h-16 rounded-full bg-white/10 blur-lg"></div>
           <div className="text-indigo-100 font-medium mb-1 text-[11px] uppercase tracking-wider z-10">Total Balance Due</div>
           <div className="text-4xl font-black tracking-tight z-10 drop-shadow-sm">${(totals.balanceAmount / 100).toFixed(2)}</div>
        </div>
        
        <PaymentMethodTabs />
        
        <div className="mt-3 min-h-[160px]">
          {activeMethod === 'CASH' && <CashPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
          {activeMethod === 'CARD' && <CardPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
          {activeMethod === 'UPI' && <UpiPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
          {activeMethod === 'SPLIT' && <SplitPaymentPanel balanceAmount={totals.balanceAmount / 100} />}
        </div>
        
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button 
            onClick={() => setIsOpen(false)} 
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel (ESC)
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={isInvalid || isPending}
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all active:scale-95 flex items-center gap-2 ${
              isInvalid || isPending ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/25 shadow-md shadow-indigo-600/10'
            }`}
          >
            {isPending && (
              <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isPending ? 'Processing...' : 'Confirm Payment (CTRL+ENTER)'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
