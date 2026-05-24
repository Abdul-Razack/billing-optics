import { useQueryClient } from '@tanstack/react-query';
import { invoiceQueryKeys } from '../../pos/hooks/useInvoice';
import { Invoice } from '../../../core/api/types';

export default function ThermalReceipt({ invoiceId }: { invoiceId: string }): JSX.Element {
  const queryClient = useQueryClient();
  const invoice = queryClient.getQueryData<Invoice>(invoiceQueryKeys.detail(invoiceId));

  if (!invoice) return <div>No invoice found</div>;

  return (
    <div style={{ width: '80mm', padding: '8mm', boxSizing: 'border-box', fontSize: '12px', lineHeight: '1.5' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: '0' }}>OPTICS POS</h2>
        <div>123 Vision Street</div>
        <div>Receipt #{invoiceId.substring(0, 8)}</div>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }} />

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Item</th>
            <th style={{ textAlign: 'right' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines?.map((item: any, i: number) => (
            <tr key={i}>
              <td>{item.productId}</td>
              <td style={{ textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>${(item.unitPrice * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>Total</strong>
        <strong>${invoice.payments?.reduce((acc: number, p: any) => acc + p.amount, 0).toFixed(2) || '0.00'}</strong>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }} />

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <div>Thank you for your business!</div>
        <div style={{ marginTop: '8px', width: '100px', height: '100px', border: '1px solid black', margin: '8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          [QR]
        </div>
      </div>
    </div>
  );
}
