/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { useEffect } from 'react';
import { usePosStore } from '../store/usePosStore';
import CartPanel from './CartPanel';
import ProductSearch from './ProductSearch';
import CustomerPanel from './CustomerPanel';
import CommandPalette from './CommandPalette';
import PaymentModal from '../../payments/components/PaymentModal';
import { initializeGlobalHotkeys } from '../../../utils/keyboard';
import { ErrorBoundary } from '../../../ui/components/ErrorBoundary';
import OfflineBanner from './OfflineBanner';
import ShortcutOverlay from './ShortcutOverlay';

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
      <div className="flex flex-col h-full overflow-hidden">
        <OfflineBanner />
        <div className="flex h-full bg-slate-50 overflow-hidden flex-1">
          <ErrorBoundary name="Product Search">
            <div className="w-[350px] border-r border-slate-200 bg-white flex flex-col shadow-sm z-10">
              <ProductSearch />
            </div>
          </ErrorBoundary>
          <ErrorBoundary name="Customer Panel">
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
              <CustomerPanel />
            </div>
          </ErrorBoundary>
          <ErrorBoundary name="Cart Panel">
            <div className="w-[400px] border-l border-slate-200 bg-white flex flex-col shadow-sm z-10">
              <CartPanel invoiceId={activeInvoiceId} />
            </div>
          </ErrorBoundary>
          <CommandPalette />
          <ShortcutOverlay />
          <PaymentModal />
        </div>
      </div>
    </ErrorBoundary>
  );
}
