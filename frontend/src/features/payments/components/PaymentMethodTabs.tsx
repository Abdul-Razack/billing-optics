/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { usePaymentStore } from '../../../core/store/payment.store';

export default function PaymentMethodTabs(): JSX.Element {
  const { activeMethod, setActiveMethod } = usePaymentStore();
  const methods = ['CASH', 'CARD', 'UPI', 'SPLIT'] as const;

  return (
    <div className="flex gap-1.5 p-1 bg-slate-100 rounded-[14px] mb-2 border border-slate-200/50">
      {methods.map((method) => (
        <button
          key={method}
          onClick={() => setActiveMethod(method)}
          className={`flex-1 py-2 px-3 rounded-[10px] font-bold text-xs transition-all duration-300 ${
            activeMethod === method
              ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-900/5 scale-[1.02]'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          {method}
        </button>
      ))}
    </div>
  );
}
