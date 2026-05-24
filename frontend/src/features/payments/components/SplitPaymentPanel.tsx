import { usePaymentStore } from '../../../core/store/payment.store';

export default function SplitPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { splitPayments, updateSplitPayment } = usePaymentStore();

  const totalSplit = splitPayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  const remaining = balanceAmount - totalSplit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {splitPayments.map((payment, index) => (
        <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '100px', fontWeight: 'bold' }}>{payment.method}</div>
          <input 
            autoFocus={index === 0}
            type="number" 
            value={payment.amount} 
            onChange={(e) => updateSplitPayment(index, e.target.value)} 
            placeholder="Amount"
            style={{ padding: '16px', fontSize: '18px', flex: 1 }}
          />
        </div>
      ))}
      <div style={{ fontSize: '20px', color: remaining === 0 ? '#22c55e' : '#ef4444' }}>
        Remaining: ${remaining.toFixed(2)}
      </div>
    </div>
  );
}
