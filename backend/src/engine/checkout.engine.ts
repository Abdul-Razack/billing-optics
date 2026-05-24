export interface CheckoutDTO {
  customerId?: number;
  items: {
    productId: number;
    quantity: number;
  }[];
  paymentMethod: string;
}

export const processCheckout = async (data: any) => ({ success: true, invoiceId: 1 });
