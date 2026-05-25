/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import ThermalReceipt from '../components/ThermalReceipt';

import { Invoice } from '../../../core/api/types';

export function printReceipt(invoice: Invoice) {
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
  doc.write(`<html>
    <head>
      <title>Receipt</title>
      <style>
        @page { margin: 0; size: 80mm auto; }
        body { 
          margin: 0; 
          padding: 0; 
          background: white; 
          font-family: monospace; 
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            width: 80mm;
            overflow: hidden;
            background: white;
            -webkit-print-color-adjust: exact;
          }
          .receipt-print {
            width: 80mm !important;
            max-width: 80mm !important;
            min-height: auto;
            margin: 0;
            padding: 2mm 4mm;
            box-shadow: none;
            font-size: 12px;
            page-break-after: avoid;
            page-break-inside: avoid;
            display: block;
          }
          .no-print {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body><div id="receipt-root"></div></body>
  </html>`);
  doc.close();

  const rootElement = doc.getElementById('receipt-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(createElement(ThermalReceipt, { invoice }));

    setTimeout(() => {
      contentWindow.focus();
      contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
}
