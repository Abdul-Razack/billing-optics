import { usePaymentStore } from '../../../core/store/payment.store';

export default function UpiPaymentPanel({ balanceAmount }: { balanceAmount: number }): JSX.Element {
  const { reference, setReference } = usePaymentStore();

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '20px' }}>Amount to pay: ${balanceAmount.toFixed(2)}</div>
        <input 
          autoFocus
          type="text" 
          value={reference} 
          onChange={(e) => setReference(e.target.value)} 
          placeholder="Enter UPI reference ID..."
          style={{ padding: '16px', fontSize: '18px', width: '100%' }}
        />
      </div>
      <div style={{ width: '150px', height: '150px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #94a3b8' }}>
        [QR Placeholder]
      </div>
    </div>
  );
}
