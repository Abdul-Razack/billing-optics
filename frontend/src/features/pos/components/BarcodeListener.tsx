import { useEffect, useRef } from 'react';
import { useBarcodeStore } from '../store/useBarcodeStore';
import { useLookupProduct } from '../hooks/useLookupProduct';

export default function BarcodeListener(): null {
  const appendChar = useBarcodeStore((state) => state.appendChar);
  const flushBarcode = useBarcodeStore((state) => state.flushBarcode);
  const { mutate: lookupProduct } = useLookupProduct();

  const lastKeyTime = useRef<number>(Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length !== 1 && e.key !== 'Enter') return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;
      
      if (timeDiff > 20) {
        flushBarcode();
      } else {
        e.preventDefault();
      }

      if (e.key === 'Enter') {
        const barcode = flushBarcode();
        if (barcode && barcode.length > 0) {
          lookupProduct(barcode);
        }
      } else if (e.key.length === 1) {
        appendChar(e.key);
      }

      lastKeyTime.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown, false);
  }, [appendChar, flushBarcode, lookupProduct]);

  return null;
}
