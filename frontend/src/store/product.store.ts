import { create } from 'zustand';

interface ProductState {
  searchQuery: string;
  categoryFilter: string | null;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  searchQuery: '',
  categoryFilter: null,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
}));

export default useProductStore;
