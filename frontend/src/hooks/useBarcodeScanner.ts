import { useEffect, useRef, useCallback } from "react";

// A barcode scanner typically fires all characters within ~50ms.
// Humans type much slower. We use this threshold to distinguish the two.
const SCANNER_KEYSTROKE_INTERVAL_MS = 50;
// Minimum number of characters to be considered a valid barcode scan.
const MIN_BARCODE_LENGTH = 3;

interface UseBarcanneScannerOptions {
  onScan: (barcode: string) => void;
  // Set to true to disable the hook temporarily (e.g. while submitting)
  disabled?: boolean;
}

/**
 * useBarcodeScanner
 *
 * Attaches a global keydown listener to detect barcode scanner input anywhere on the page.
 * Scanners fire characters very quickly and always end with an "Enter" key.
 * This hook measures inter-keystroke timing to distinguish a scanner from human typing.
 *
 * Usage:
 *   useBarcodeScanner({ onScan: (code) => handleScan(code) });
 */
export function useBarcodeScanner({ onScan, disabled = false }: UseBarcanneScannerOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  // Keep the callback ref up to date without needing to re-attach the listener
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if disabled
    if (disabled) return;

    // Ignore modifier keys (Ctrl+C, Alt+Tab etc.)
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    if (e.key === "Enter") {
      const scanned = bufferRef.current.trim();
      bufferRef.current = "";

      if (scanned.length >= MIN_BARCODE_LENGTH) {
        // Prevent the Enter from being handled by other listeners (e.g. form submit)
        // only when we successfully intercept a scan
        e.preventDefault();
        e.stopPropagation();
        onScanRef.current(scanned);
      }
      return;
    }

    // If the gap between keystrokes is too long, this is human typing — reset buffer
    if (timeSinceLastKey > SCANNER_KEYSTROKE_INTERVAL_MS && bufferRef.current.length > 0) {
      bufferRef.current = "";
    }

    // Only accumulate printable single characters
    if (e.key.length === 1) {
      bufferRef.current += e.key;
    }
  }, [disabled]);

  useEffect(() => {
    // Attach to the window so it is truly global — works regardless of which
    // element has keyboard focus on the page.
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);
}
