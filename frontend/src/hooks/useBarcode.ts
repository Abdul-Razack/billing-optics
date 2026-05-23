import { useEffect, useRef } from 'react';

export function useBarcode(onScan: (barcode: string) => void) {
  const buffer = useRef<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (buffer.current) {
          onScan(buffer.current);
          buffer.current = '';
        }
      } else {
        // Simple buffer appending for scanners that fire rapid keys
        if (e.key.length === 1) {
          buffer.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);
}

export default useBarcode;
