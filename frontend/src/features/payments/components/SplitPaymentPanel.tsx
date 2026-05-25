/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { usePaymentStore } from '../../../core/store/payment.store';

export default function SplitPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { splitPayments, updateSplitPayment } = usePaymentStore();

  const totalSplit = splitPayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  const remaining = balanceAmount - totalSplit;

  return (
    <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="grid gap-2">
        {splitPayments.map((payment, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white shadow-sm">
            <div className="w-20 px-2 py-1.5 bg-slate-200/50 text-slate-700 font-bold rounded-lg text-center text-xs tracking-widest uppercase">
              {payment.method}
            </div>
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 font-bold">$</span>
              <input 
                autoFocus={index === 0}
                type="number" 
                value={payment.amount} 
                onChange={(e) => updateSplitPayment(index, e.target.value)} 
                placeholder="0.00"
                className="w-full text-lg font-bold bg-transparent pl-6 pr-3 py-1 focus:outline-none text-slate-800 placeholder-slate-300"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className={`mt-1 p-4 rounded-xl flex justify-between items-center transition-all duration-300 shadow-inner border ${Math.abs(remaining) < 0.01 ? 'bg-emerald-50 border-emerald-200' : remaining < 0 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}>
        <span className={`font-bold uppercase tracking-wider text-[11px] ${Math.abs(remaining) < 0.01 ? 'text-emerald-700' : remaining < 0 ? 'text-amber-700' : 'text-rose-700'}`}>
          {Math.abs(remaining) < 0.01 ? 'Fully Allocated' : remaining < 0 ? 'Over Allocated' : 'Remaining Balance'}
        </span>
        <span className={`text-2xl font-black ${Math.abs(remaining) < 0.01 ? 'text-emerald-600' : remaining < 0 ? 'text-amber-600' : 'text-rose-600'}`}>
          ${Math.abs(remaining).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
