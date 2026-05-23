import api from './api';

export const billingService = {
  async createInvoice(payload: any, token: string) {
    return api.post('/billing/invoices', payload, token);
  },
  async getInvoice(id: string, token: string) {
    return api.get(`/billing/invoices/${id}`, token);
  },
};

export default billingService;
