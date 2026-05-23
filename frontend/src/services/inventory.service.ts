import api from './api';

export const inventoryService = {
  async getProducts(token: string) {
    return api.get('/products', token);
  },
  async updateStock(payload: any, token: string) {
    return api.post('/inventory/stock', payload, token);
  },
};

export default inventoryService;
