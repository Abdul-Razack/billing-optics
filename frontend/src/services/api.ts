const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  async get(url: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}${url}`, { headers });
    return res.json();
  },

  async post(url: string, data: any, token?: string) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export default api;
