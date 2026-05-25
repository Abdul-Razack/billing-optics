/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { usePaymentStore } from '../../../core/store/payment.store';

export default function CashPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { enteredCash, setEnteredCash } = usePaymentStore();
  
  const cashAmount = parseFloat(enteredCash) || 0;
  const change = Math.max(0, cashAmount - balanceAmount);

  return (
    <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-slate-400 text-2xl font-black transition-colors group-focus-within:text-indigo-500">$</span>
        </div>
        <input 
          autoFocus
          type="number" 
          value={enteredCash} 
          onChange={(e) => setEnteredCash(e.target.value)} 
          placeholder="0.00"
          className="w-full text-3xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl pl-10 pr-4 py-4 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-300 shadow-sm"
        />
      </div>
      
      <div className="flex gap-2">
        {[10, 20, 50, 100].map((denom) => (
          <button 
            key={denom} 
            onClick={() => setEnteredCash((cashAmount + denom).toString())}
            className="flex-1 py-2.5 text-base font-bold bg-white border-2 border-slate-100 text-slate-600 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-95 shadow-sm"
          >
            +${denom}
          </button>
        ))}
        <button 
          onClick={() => setEnteredCash(balanceAmount.toString())}
          className="flex-1 py-2.5 text-base font-bold bg-indigo-600 text-white border-2 border-indigo-600 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
        >
          Exact
        </button>
      </div>
      
      <div className={`mt-1 p-4 rounded-2xl flex justify-between items-center transition-all duration-300 shadow-inner border ${change > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <span className={`font-bold uppercase tracking-wider text-[11px] ${change > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>Change Due</span>
        <span className={`text-2xl font-black ${change > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
          ${change.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
