import { create } from 'zustand';

interface NetworkState {
  isOnline: boolean;
  lastOnlineAt: number | null;
  setOnline: () => void;
  setOffline: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: navigator.onLine,
  lastOnlineAt: navigator.onLine ? Date.now() : null,
  setOnline: () => set({ isOnline: true, lastOnlineAt: Date.now() }),
  setOffline: () => set({ isOnline: false }),
}));

window.addEventListener('online', () => useNetworkStore.getState().setOnline());
window.addEventListener('offline', () => useNetworkStore.getState().setOffline());
