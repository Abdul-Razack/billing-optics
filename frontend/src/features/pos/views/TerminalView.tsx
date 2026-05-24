import { useEffect } from 'react';
import PosTerminal from '../components/PosTerminal';
import BarcodeListener from '../components/BarcodeListener';
import { keyboardManager, HOTKEYS } from '../../../utils/keyboard';

export default function TerminalView(): JSX.Element {
  useEffect(() => {
    const unsubs = [
      keyboardManager.register(HOTKEYS.SEARCH_PRODUCT, () => console.log('Search Product')),
      keyboardManager.register(HOTKEYS.PAYMENT_MODAL, () => console.log('Payment Modal')),
      keyboardManager.register(HOTKEYS.SUSPEND_CART, () => console.log('Suspend Cart')),
      keyboardManager.register(HOTKEYS.ATTACH_CUSTOMER, () => console.log('Attach Customer')),
      keyboardManager.register(HOTKEYS.PRINT_RECEIPT, () => console.log('Print Receipt')),
      keyboardManager.register(HOTKEYS.CLOSE_MODAL, () => console.log('Close Modal')),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  return (
    <>
      <BarcodeListener />
      <PosTerminal />
    </>
  );
}
