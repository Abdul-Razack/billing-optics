/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { usePaymentStore } from '../../../core/store/payment.store';

export default function CashPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { enteredCash, setEnteredCash } = usePaymentStore();
  
  const cashAmount = parseFloat(enteredCash) || 0;
  const change = Math.max(0, cashAmount - balanceAmount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input 
        autoFocus
        type="number" 
        value={enteredCash} 
        onChange={(e) => setEnteredCash(e.target.value)} 
        placeholder="Enter cash amount..."
        style={{ padding: '16px', fontSize: '24px', width: '100%' }}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        {[10, 20, 50, 100].map((denom) => (
          <button 
            key={denom} 
            onClick={() => setEnteredCash((cashAmount + denom).toString())}
            style={{ padding: '16px', flex: 1, fontSize: '18px', cursor: 'pointer' }}
          >
            +${denom}
          </button>
        ))}
        <button 
          onClick={() => setEnteredCash(balanceAmount.toString())}
          style={{ padding: '16px', flex: 1, fontSize: '18px', cursor: 'pointer', backgroundColor: '#e2e8f0' }}
        >
          Exact
        </button>
      </div>
      <div style={{ fontSize: '20px', color: change > 0 ? '#22c55e' : '#64748b' }}>
        Change Due: ${change.toFixed(2)}
      </div>
    </div>
  );
}
