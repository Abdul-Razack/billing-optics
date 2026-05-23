import api from './api';

export const authService = {
  async login(payload: any) {
    return api.post('/auth/login', payload);
  },
  async register(payload: any) {
    return api.post('/auth/register', payload);
  },
};

export default authService;
