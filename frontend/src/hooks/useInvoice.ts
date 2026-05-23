export function useInvoice() {
  return {
    invoice: null,
    items: [],
    addItem: () => {},
    removeItem: () => {},
    calculateTotals: () => {},
  };
}

export default useInvoice;
