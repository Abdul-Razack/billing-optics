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
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-80 mt-10">
            <div className="w-24 h-24 mb-6 bg-slate-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-base font-medium text-slate-500">Cart is empty</p>
            <p className="text-xs mt-1 text-slate-400">Scan or search products to begin.</p>
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
