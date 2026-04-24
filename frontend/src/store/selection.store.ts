import { create } from 'zustand';
import type { Selection } from '@/core/entities/selection';
import type { ISearchPort } from '@/core/ports/search.port';
import type { ISelectionPort } from '@/core/ports/selection.port';
import type { SearchCompaniesRequest } from '@/core/types/search.types';
import type { ApiError } from '@/core/types/auth.types';
import { AxiosError } from 'axios';

interface SelectionState {
  currentSelection: Selection | null;
  isSearching: boolean;
  error: string | null;
  search: (data: SearchCompaniesRequest) => Promise<void>;
  pollSelection: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

function normalizeError(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as ApiError;
    if (Array.isArray(data.message)) {
      return data.message.join('. ');
    }
    return data.message || 'Произошла ошибка';
  }
  return 'Произошла ошибка';
}

export function createSelectionStore(searchPort: ISearchPort, selectionPort: ISelectionPort) {
  return create<SelectionState>((set, get) => ({
    currentSelection: null,
    isSearching: false,
    error: null,

    search: async (data) => {
      set({ isSearching: true, error: null, currentSelection: null });
      try {
        const selection = await searchPort.searchCompanies(data);
        set({ currentSelection: selection, isSearching: false });
      } catch (err) {
        set({ isSearching: false, error: normalizeError(err) });
      }
    },

    pollSelection: async () => {
      const { currentSelection } = get();
      if (!currentSelection) return;
      try {
        const updated = await selectionPort.getSelection(currentSelection.id);
        set({ currentSelection: updated });
      } catch (err) {
        set({ error: normalizeError(err) });
      }
    },

    reset: () => set({ currentSelection: null, isSearching: false, error: null }),
    clearError: () => set({ error: null }),
  }));
}
