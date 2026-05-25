/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { mutationQueue, QueuedMutation } from './mutation.queue';
import { useNetworkStore } from '../store/network.store';

class QueueWorker {
  private isProcessing = false;
  private maxRetries = 5;

  start() {
    window.addEventListener('online', () => this.processQueue());
    setInterval(() => {
      if (useNetworkStore.getState().isOnline) {
        this.processQueue();
      }
    }, 10000);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || !useNetworkStore.getState().isOnline) return;
    this.isProcessing = true;

    try {
      const queue = await mutationQueue.getQueue();
      for (const mutation of queue) {
        if (!useNetworkStore.getState().isOnline) break;

        const success = await this.executeMutation(mutation);
        if (success) {
          await mutationQueue.dequeue(mutation.id);
        } else {
          if (mutation.retryCount >= this.maxRetries) {
            await mutationQueue.dequeue(mutation.id);
          } else {
            await mutationQueue.updateRetryCount(mutation.id, mutation.retryCount + 1);
            break;
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeMutation(mutation: QueuedMutation): Promise<boolean> {
    try {
      let url = '';
      let method = 'POST';
      let body: any = undefined;

      switch (mutation.type) {
        case 'addInvoiceItem':
          url = `/api/invoices/${mutation.payload.invoiceId}/items`;
          body = { productId: mutation.payload.productId, qty: mutation.payload.qty };
          break;
        case 'linkCustomer':
          url = `/api/invoices/${mutation.payload.invoiceId}/customer`;
          method = 'PUT';
          body = { customerId: mutation.payload.customerId };
          break;
        case 'savePrescription':
          url = `/api/customers/${mutation.payload.customerId}/prescriptions`;
          body = mutation.payload.data;
          break;
        default:
          return true; // Unknown type, discard
      }

      const token = localStorage.getItem('access_token');
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      
      if (res.status === 401) {
        return false;
      }
      return res.ok;
    } catch (e) {
      return false;
    }
  }
}

export const queueWorker = new QueueWorker();
