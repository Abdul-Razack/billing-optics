/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { usePaymentStore } from '../../../core/store/payment.store';

export default function UpiPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { reference, setReference } = usePaymentStore();

  return (
    <div className="flex gap-5 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex-1 flex flex-col gap-4 justify-center">
        <div>
          <div className="text-slate-500 font-bold mb-1 uppercase tracking-wider text-[11px]">Amount to Pay</div>
          <div className="text-3xl font-black text-slate-800">${balanceAmount.toFixed(2)}</div>
        </div>
        <div className="relative">
          <input 
            autoFocus
            type="text" 
            value={reference} 
            onChange={(e) => setReference(e.target.value)} 
            placeholder="Enter UPI Reference ID"
            className="w-full text-base font-medium bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>
      
      <div className="w-36 h-36 bg-white border-2 border-slate-100 rounded-2xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <svg className="w-16 h-16 text-slate-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <span className="text-[10px] font-bold text-slate-400 mt-1 relative z-10">Scan to Pay</span>
      </div>
    </div>
  );
}
