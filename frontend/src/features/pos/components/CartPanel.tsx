/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useInvoice } from '../hooks/useInvoice';
import { usePaymentStore } from '../../../core/store/payment.store';
import CartLineItem from './CartLineItem';

interface CartPanelProps {
  invoiceId: string | null;
}

export default function CartPanel({ invoiceId }: CartPanelProps): JSX.Element {
  const { data: invoice, isLoading, error } = useInvoice(invoiceId || '');

  if (!invoiceId) {
    return <div>No active invoice</div>;
  }

  if (isLoading) return <div>Loading cart...</div>;
  if (error || !invoice) return <div>Error loading cart</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-800">Current Cart</h2>
        <p className="text-sm text-slate-500">{invoice.lineItemIds?.length || 0} items</p>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {invoice.lineItemIds?.map((id: string) => (
          <CartLineItem key={id} invoiceId={invoice.id} itemId={id} />
        ))}
        {(!invoice.lineItemIds || invoice.lineItemIds.length === 0) && (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Cart is empty. Scan or search products to begin.
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
        <div className="flex justify-between items-end mb-4">
          <span className="text-slate-500 font-medium">Total</span>
          <span className="text-3xl font-bold text-slate-800">
            {"$"}{((invoice.lines?.reduce((acc: number, item: any) => acc + ((item.unitPrice || 0) * (item.quantity || 1)), 0) || 0) / 100).toFixed(2)}
          </span>
        </div>
        <button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          disabled={!invoice.lineItemIds || invoice.lineItemIds.length === 0}
          onClick={() => usePaymentStore.getState().setIsOpen(true)}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
