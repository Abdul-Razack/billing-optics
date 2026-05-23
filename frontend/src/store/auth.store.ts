import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (user: any, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}));

export default useAuthStore;
