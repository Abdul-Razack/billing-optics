import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import ThermalReceipt from '../components/ThermalReceipt';

export function printReceipt(invoiceId: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const contentWindow = iframe.contentWindow;
  if (!contentWindow) return;

  const doc = contentWindow.document;
  doc.open();
  doc.write('<html><head><title>Receipt</title><style>body { margin: 0; padding: 0; font-family: monospace; }</style></head><body><div id="receipt-root"></div></body></html>');
  doc.close();

  const rootElement = doc.getElementById('receipt-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(createElement(ThermalReceipt, { invoiceId }));

    setTimeout(() => {
      contentWindow.focus();
      contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
}
