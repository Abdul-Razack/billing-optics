// Unique invoice number generation utility
export const generateInvoiceNumber = (prefix = 'OPT', count = 1) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const paddedCount = count.toString().padStart(6, '0');
  return `${prefix}-${year}${month}-${paddedCount}`;
};
export default generateInvoiceNumber;
