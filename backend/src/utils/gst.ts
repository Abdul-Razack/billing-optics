// GST Calculations Utility
export const calculateGST = (priceWithoutTax: number, ratePercent: number) => {
  const taxAmount = (priceWithoutTax * ratePercent) / 100;
  const totalPrice = priceWithoutTax + taxAmount;
  return {
    taxAmount,
    totalPrice,
  };
};
export default calculateGST;
