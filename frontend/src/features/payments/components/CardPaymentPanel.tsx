/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { usePaymentStore } from '../../../core/store/payment.store';

export default function CardPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { reference, setReference } = usePaymentStore();

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col items-center justify-center py-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <div className="text-slate-500 font-medium mb-1 uppercase tracking-widest text-[11px]">Amount to Swipe</div>
        <div className="text-3xl font-black text-slate-800">${balanceAmount.toFixed(2)}</div>
      </div>
      
      <div className="relative">
        <input 
          autoFocus
          type="text" 
          value={reference} 
          onChange={(e) => setReference(e.target.value)} 
          placeholder="Enter Ref / Auth Code (Optional)"
          className="w-full text-base font-medium bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
        />
      </div>
    </div>
  );
}
