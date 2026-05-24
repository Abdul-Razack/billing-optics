import { Money, Paise } from '../domain/utils/money.util';

export interface InvoiceItem {
  productId: string;
  quantity: number;
  price: Paise;
  total: Paise;
}

export interface InvoiceState {
  id: string;
  customerId: string;
  subtotal: Paise;
  taxTotal: Paise;
  discountTotal: Paise;
  grandTotal: Paise;
  amountPaid: Paise;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  items: InvoiceItem[];
  createdAt: number;
}

export interface InventoryItem {
  productId: string;
  quantity: number;
  lastUpdated: number;
}

export interface State {
  invoices: InvoiceState[];
  inventory: InventoryItem[];
  balances: Record<string, Paise>;
}

export function applyEvent(state: State, event: { type: string; payload: any; timestamp: number }): State {
  const nextState: State = {
    invoices: state.invoices.map(inv => ({
      ...inv,
      items: inv.items.map(item => ({ ...item })),
    })),
    inventory: state.inventory.map(item => ({ ...item })),
    balances: { ...state.balances },
  };

  switch (event.type) {
    case 'INVOICE_CREATED': {
      const { invoiceId, customerId } = event.payload;
      if (!invoiceId || !customerId) {
        throw new Error('Invalid INVOICE_CREATED payload');
      }
      if (nextState.invoices.some(inv => inv.id === invoiceId)) {
        throw new Error(`Invoice with ID ${invoiceId} already exists`);
      }
      nextState.invoices.push({
        id: invoiceId,
        customerId,
        subtotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        grandTotal: 0,
        amountPaid: 0,
        status: 'UNPAID',
        items: [],
        createdAt: event.timestamp,
      });
      if (nextState.balances[customerId] === undefined) {
        nextState.balances[customerId] = 0;
      }
      break;
    }

    case 'ITEM_ADDED': {
      const { invoiceId, productId, quantity, price } = event.payload;
      if (!invoiceId || !productId || typeof quantity !== 'number' || typeof price !== 'number') {
        throw new Error('Invalid ITEM_ADDED payload');
      }
      const invoice = nextState.invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} not found`);
      }

      const itemPrice = Money.fromPaise(price);
      const itemTotal = itemPrice.multiply(quantity);

      const existingItem = invoice.items.find(item => item.productId === productId);
      if (existingItem) {
        const currentQty = existingItem.quantity;
        const newQty = currentQty + quantity;
        existingItem.quantity = newQty;
        existingItem.total = Money.fromPaise(existingItem.price).multiply(newQty).getPaise();
      } else {
        invoice.items.push({
          productId,
          quantity,
          price,
          total: itemTotal.getPaise(),
        });
      }

      const subtotalMoney = Money.fromPaise(invoice.subtotal).add(itemTotal);
      invoice.subtotal = subtotalMoney.getPaise();

      const taxMoney = Money.fromPaise(invoice.taxTotal);
      const discountMoney = Money.fromPaise(invoice.discountTotal);
      const grandTotalMoney = subtotalMoney.add(taxMoney).subtract(discountMoney);
      invoice.grandTotal = grandTotalMoney.getPaise();

      const amountPaidMoney = Money.fromPaise(invoice.amountPaid);
      if (amountPaidMoney.getPaise() === 0) {
        invoice.status = 'UNPAID';
      } else if (amountPaidMoney.getPaise() >= invoice.grandTotal) {
        invoice.status = 'PAID';
      } else {
        invoice.status = 'PARTIAL';
      }

      const currentBalance = Money.fromPaise(nextState.balances[invoice.customerId] || 0);
      nextState.balances[invoice.customerId] = currentBalance.add(itemTotal).getPaise();

      const invItem = nextState.inventory.find(item => item.productId === productId);
      if (invItem) {
        invItem.quantity = invItem.quantity - quantity;
        invItem.lastUpdated = event.timestamp;
      } else {
        nextState.inventory.push({
          productId,
          quantity: -quantity,
          lastUpdated: event.timestamp,
        });
      }
      break;
    }

    case 'DISCOUNT_ALLOCATED': {
      const { invoiceId, amount } = event.payload;
      if (!invoiceId || typeof amount !== 'number') {
        throw new Error('Invalid DISCOUNT_ALLOCATED payload');
      }
      const invoice = nextState.invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} not found`);
      }

      const discountAllocated = Money.fromPaise(amount);
      const currentDiscount = Money.fromPaise(invoice.discountTotal);
      const newDiscount = currentDiscount.add(discountAllocated);
      invoice.discountTotal = newDiscount.getPaise();

      const subtotalMoney = Money.fromPaise(invoice.subtotal);
      const taxMoney = Money.fromPaise(invoice.taxTotal);
      const newGrandTotal = subtotalMoney.add(taxMoney).subtract(newDiscount);
      invoice.grandTotal = newGrandTotal.getPaise();

      const amountPaidMoney = Money.fromPaise(invoice.amountPaid);
      if (amountPaidMoney.getPaise() === 0) {
        invoice.status = 'UNPAID';
      } else if (amountPaidMoney.getPaise() >= invoice.grandTotal) {
        invoice.status = 'PAID';
      } else {
        invoice.status = 'PARTIAL';
      }

      const currentBalance = Money.fromPaise(nextState.balances[invoice.customerId] || 0);
      nextState.balances[invoice.customerId] = currentBalance.subtract(discountAllocated).getPaise();
      break;
    }

    case 'GST_APPLIED': {
      const { invoiceId, rate } = event.payload;
      if (!invoiceId || typeof rate !== 'number') {
        throw new Error('Invalid GST_APPLIED payload');
      }
      const invoice = nextState.invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} not found`);
      }

      const subtotalMoney = Money.fromPaise(invoice.subtotal);
      const discountMoney = Money.fromPaise(invoice.discountTotal);
      const netAmount = subtotalMoney.subtract(discountMoney);

      const newTaxMoney = netAmount.multiply(rate).divide(100);
      const oldTaxMoney = Money.fromPaise(invoice.taxTotal);
      const taxDelta = newTaxMoney.subtract(oldTaxMoney);

      invoice.taxTotal = newTaxMoney.getPaise();

      const currentGrandTotal = Money.fromPaise(invoice.grandTotal);
      invoice.grandTotal = currentGrandTotal.add(taxDelta).getPaise();

      const amountPaidMoney = Money.fromPaise(invoice.amountPaid);
      if (amountPaidMoney.getPaise() === 0) {
        invoice.status = 'UNPAID';
      } else if (amountPaidMoney.getPaise() >= invoice.grandTotal) {
        invoice.status = 'PAID';
      } else {
        invoice.status = 'PARTIAL';
      }

      const currentBalance = Money.fromPaise(nextState.balances[invoice.customerId] || 0);
      nextState.balances[invoice.customerId] = currentBalance.add(taxDelta).getPaise();
      break;
    }

    case 'PAYMENT_RECEIVED': {
      const { invoiceId, customerId, amount } = event.payload;
      if (!invoiceId || !customerId || typeof amount !== 'number') {
        throw new Error('Invalid PAYMENT_RECEIVED payload');
      }
      const invoice = nextState.invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error(`Invoice ${invoiceId} not found`);
      }

      const paymentAmount = Money.fromPaise(amount);
      const currentAmountPaid = Money.fromPaise(invoice.amountPaid);
      const newAmountPaid = currentAmountPaid.add(paymentAmount);
      invoice.amountPaid = newAmountPaid.getPaise();

      if (newAmountPaid.getPaise() === 0) {
        invoice.status = 'UNPAID';
      } else if (newAmountPaid.getPaise() >= invoice.grandTotal) {
        invoice.status = 'PAID';
      } else {
        invoice.status = 'PARTIAL';
      }

      const currentBalance = Money.fromPaise(nextState.balances[customerId] || 0);
      nextState.balances[customerId] = currentBalance.subtract(paymentAmount).getPaise();
      break;
    }

    default:
      throw new Error(`Unknown event type: ${event.type}`);
  }

  return nextState;
}
