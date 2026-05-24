import { create } from 'zustand';

interface SearchState {
  search: string;
  highlightedIndex: number;
  isSearchFocused: boolean;
  setSearch: (value: string) => void;
  setHighlightedIndex: (index: number) => void;
  setSearchFocused: (value: boolean) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  search: '',
  highlightedIndex: 0,
  isSearchFocused: false,
  setSearch: (value) => set({ search: value, highlightedIndex: 0 }),
  setHighlightedIndex: (index) => set({ highlightedIndex: index }),
  setSearchFocused: (value) => set({ isSearchFocused: value }),
  reset: () => set({ search: '', highlightedIndex: 0, isSearchFocused: false }),
}));
