import { queryClient } from '../../../app/providers';
import { Product, Invoice } from '../../../core/api/types';

export default function ThermalReceipt({ invoice }: { invoice: Invoice }): JSX.Element {
  if (!invoice) return <div>No invoice found</div>;

  const getProductName = (productId: number) => {
    let name = String(productId);
    const queries = queryClient.getQueriesData<Product[]>({ queryKey: ['products', 'search'] });
    for (const [, cachedProducts] of queries) {
      const product = cachedProducts?.find(p => String(p.id) === String(productId));
      if (product) {
        name = product.name;
        break;
      }
    }
    return name;
  };

  return (
    <div className="receipt-print" style={{ boxSizing: 'border-box', lineHeight: '1.5' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: '0' }}>OPTICS POS</h2>
        <div>123 Vision Street</div>
        <div>Receipt #{invoice.id.substring(0, 8)}</div>
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
              <td style={{ maxWidth: '40mm', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getProductName(item.productId)}</td>
              <td style={{ textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>${((item.unitPrice * item.quantity) / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>Total</strong>
        <strong>${((invoice.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0) / 100).toFixed(2)}</strong>
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '8px 0' }} />

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <div>Thank you for your business!</div>
      </div>
    </div>
  );
}
