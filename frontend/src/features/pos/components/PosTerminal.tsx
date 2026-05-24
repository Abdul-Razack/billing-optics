import { useEffect } from 'react';
import { usePosStore } from '../store/usePosStore';
import CartPanel from './CartPanel';
import ProductSearch from './ProductSearch';
import CustomerPanel from './CustomerPanel';
import CommandPalette from './CommandPalette';
import PaymentModal from '../../payments/components/PaymentModal';
import { initializeGlobalHotkeys } from '../../../utils/keyboard';
import { ErrorBoundary } from '../../../ui/components/ErrorBoundary';

export default function PosTerminal(): JSX.Element {
  const activeInvoiceId = usePosStore((state) => state.activeInvoiceId);
  const setActiveInvoiceId = usePosStore((state) => state.setActiveInvoiceId);

  useEffect(() => {
    initializeGlobalHotkeys();
    if (!activeInvoiceId) {
      setActiveInvoiceId('INV-001');
    }
  }, [activeInvoiceId, setActiveInvoiceId]);

  return (
    <ErrorBoundary name="POS Terminal">
      <div className="pos-terminal" style={{ display: 'flex', height: '100%' }}>
        <ErrorBoundary name="Product Search">
          <div style={{ width: '300px', borderRight: '1px solid #cbd5e1' }}>
            <ProductSearch />
          </div>
        </ErrorBoundary>
        <ErrorBoundary name="Customer Panel">
          <div style={{ flex: 1, borderRight: '1px solid #cbd5e1' }}>
            <CustomerPanel />
          </div>
        </ErrorBoundary>
        <ErrorBoundary name="Cart Panel">
          <div style={{ width: '400px' }}>
            <CartPanel invoiceId={activeInvoiceId} />
          </div>
        </ErrorBoundary>
        <CommandPalette />
        <PaymentModal />
      </div>
    </ErrorBoundary>
  );
}
