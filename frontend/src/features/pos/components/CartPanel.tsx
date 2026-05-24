import { useInvoice } from '../hooks/useInvoice';
import CartLineItem from './CartLineItem';

interface CartPanelProps {
  invoiceId: string | null;
}

export default function CartPanel({ invoiceId }: CartPanelProps): JSX.Element {
  if (!invoiceId) {
    return <div>No active invoice</div>;
  }

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);

  if (isLoading) return <div>Loading cart...</div>;
  if (error || !invoice) return <div>Error loading cart</div>;

  return (
    <div className="cart-panel">
      <h2>Total: ${invoice.total.toFixed(2)}</h2>
      <div className="line-items">
        {invoice.lineItemIds?.map((id: string) => (
          <CartLineItem key={id} invoiceId={invoice.id} itemId={id} />
        ))}
      </div>
    </div>
  );
}
