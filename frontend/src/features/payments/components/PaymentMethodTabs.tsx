import { usePaymentStore } from '../../../core/store/payment.store';

export default function PaymentMethodTabs(): JSX.Element {
  const { activeMethod, setActiveMethod } = usePaymentStore();
  const methods = ['CASH', 'CARD', 'UPI', 'SPLIT'] as const;

  return (
    <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0' }}>
      {methods.map((method) => (
        <button
          key={method}
          onClick={() => setActiveMethod(method)}
          style={{
            padding: '12px 24px',
            cursor: 'pointer',
            backgroundColor: activeMethod === method ? '#3b82f6' : 'transparent',
            color: activeMethod === method ? 'white' : 'black',
            border: 'none',
            fontWeight: 'bold',
            flex: 1,
          }}
        >
          {method}
        </button>
      ))}
    </div>
  );
}
