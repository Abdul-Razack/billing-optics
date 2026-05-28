import PDFDocument from 'pdfkit';

export const generateInvoicePdf = (invoiceData: any, settingsData: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- Colors & Fonts ---
      const primaryColor = '#0f172a';
      const secondaryColor = '#475569';
      const accentColor = '#3b82f6';
      
      // --- Header (Business Details & Invoice Meta) ---
      doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text(settingsData.businessName || 'Business Name', 50, 50);
      
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica');
      let currentY = 80;
      if (settingsData.address) { doc.text(settingsData.address, 50, currentY); currentY += 15; }
      if (settingsData.phone) { doc.text(`Phone: ${settingsData.phone}`, 50, currentY); currentY += 15; }
      if (settingsData.email) { doc.text(`Email: ${settingsData.email}`, 50, currentY); currentY += 15; }
      if (settingsData.gstNumber) { doc.text(`GSTIN: ${settingsData.gstNumber}`, 50, currentY); }

      // Invoice Details (Right Side)
      doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('INVOICE', 400, 50, { align: 'right' });
      
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica');
      doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 400, 80, { align: 'right' });
      const dateStr = new Date(invoiceData.createdAt).toLocaleDateString();
      doc.text(`Date: ${dateStr}`, 400, 95, { align: 'right' });
      doc.fillColor(invoiceData.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b').font('Helvetica-Bold')
         .text(`Status: ${invoiceData.paymentStatus}`, 400, 110, { align: 'right' });

      // --- Customer Details ---
      doc.moveDown(3);
      const customerY = doc.y;
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, customerY);
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica');
      if (invoiceData.customer) {
        doc.text(invoiceData.customer.name, 50, customerY + 15);
        if (invoiceData.customer.phone) doc.text(invoiceData.customer.phone, 50, customerY + 30);
        if (invoiceData.customer.address) doc.text(invoiceData.customer.address, 50, customerY + 45);
      } else {
        doc.text('Walk-in Customer', 50, customerY + 15);
      }

      // --- Line Items Table ---
      doc.moveDown(3);
      const tableTop = doc.y + 10;
      
      doc.fillColor(primaryColor).font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 280, tableTop, { width: 40, align: 'right' });
      doc.text('Unit Price', 330, tableTop, { width: 70, align: 'right' });
      doc.text('GST', 410, tableTop, { width: 40, align: 'right' });
      doc.text('Amount', 460, tableTop, { width: 85, align: 'right' });
      
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).lineWidth(1).strokeColor('#e2e8f0').stroke();

      let itemY = tableTop + 25;
      doc.font('Helvetica');
      
      const currencySymbol = settingsData.currency === 'USD' ? '$' : '₹';
      const formatCurrency = (val: number) => `${currencySymbol}${val.toFixed(2)}`;

      for (const item of invoiceData.items) {
        // Multi-page protection
        if (itemY > 700) {
          doc.addPage();
          itemY = 50;
        }

        doc.fillColor(secondaryColor).text(item.productName, 50, itemY, { width: 220 });
        doc.text(item.quantity.toString(), 280, itemY, { width: 40, align: 'right' });
        doc.text(formatCurrency(item.unitPrice), 330, itemY, { width: 70, align: 'right' });
        doc.text(`${item.gstPercent || 0}%`, 410, itemY, { width: 40, align: 'right' });
        doc.text(formatCurrency(item.total), 460, itemY, { width: 85, align: 'right' });
        
        itemY += 20;
      }
      
      doc.moveTo(50, itemY).lineTo(545, itemY).lineWidth(1).strokeColor('#e2e8f0').stroke();

      // --- Totals Section ---
      itemY += 15;
      doc.font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('Subtotal:', 350, itemY, { width: 100, align: 'right' });
      doc.font('Helvetica').fillColor(secondaryColor);
      doc.text(formatCurrency(invoiceData.subtotal), 460, itemY, { width: 85, align: 'right' });
      
      if (invoiceData.discountTotal > 0) {
        itemY += 20;
        doc.font('Helvetica-Bold').fillColor(primaryColor);
        doc.text('Discount:', 350, itemY, { width: 100, align: 'right' });
        doc.font('Helvetica').fillColor('#ef4444');
        doc.text(`-${formatCurrency(invoiceData.discountTotal)}`, 460, itemY, { width: 85, align: 'right' });
      }

      itemY += 20;
      doc.font('Helvetica-Bold').fillColor(primaryColor);
      doc.text('Tax (GST):', 350, itemY, { width: 100, align: 'right' });
      doc.font('Helvetica').fillColor(secondaryColor);
      doc.text(formatCurrency(invoiceData.taxTotal), 460, itemY, { width: 85, align: 'right' });

      itemY += 25;
      doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor);
      doc.text('Grand Total:', 350, itemY, { width: 100, align: 'right' });
      doc.text(formatCurrency(invoiceData.grandTotal), 460, itemY, { width: 85, align: 'right' });

      // --- Payment Summary ---
      if (invoiceData.payments && invoiceData.payments.length > 0) {
        itemY += 40;
        if (itemY > 700) { doc.addPage(); itemY = 50; }
        
        doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text('Payment History', 50, itemY);
        itemY += 20;
        doc.fontSize(10).font('Helvetica');
        
        for (const payment of invoiceData.payments) {
          const pDate = new Date(payment.paymentDate).toLocaleDateString();
          doc.fillColor(secondaryColor).text(`${pDate} - ${payment.paymentMethod}`, 50, itemY);
          doc.fillColor(primaryColor).text(formatCurrency(payment.amount), 200, itemY);
          itemY += 15;
        }
      }

      // --- Footer ---
      const pageHeight = doc.page.height;
      doc.fontSize(10).font('Helvetica-Oblique').fillColor('#94a3b8');
      doc.text('Thank you for your business!', 50, pageHeight - 50, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
