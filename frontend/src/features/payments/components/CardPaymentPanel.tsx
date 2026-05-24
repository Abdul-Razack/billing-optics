import { usePaymentStore } from '../../../core/store/payment.store';

export default function CardPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { reference, setReference } = usePaymentStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '20px' }}>Amount to swipe: ${balanceAmount.toFixed(2)}</div>
      <input 
        autoFocus
        type="text" 
        value={reference} 
        onChange={(e) => setReference(e.target.value)} 
        placeholder="Enter card reference / authorization code..."
        style={{ padding: '16px', fontSize: '18px', width: '100%' }}
      />
    </div>
  );
}
