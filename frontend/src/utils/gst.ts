export const calculateGST = (price: number, ratePercent: number) => {
  const taxAmount = (price * ratePercent) / 100;
  return {
    taxAmount,
    totalPrice: price + taxAmount,
  };
};

export default calculateGST;
