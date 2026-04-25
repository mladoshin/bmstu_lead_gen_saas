import { create } from 'zustand';
import type { ISelectionStore } from '@/core/ports/selection-store.port';
import type { ISearchPort } from '@/core/ports/search.port';
import type { ISelectionPort } from '@/core/ports/selection.port';
import { normalizeError } from '@/core/utils/normalize-error';

export function createSelectionStore(searchPort: ISearchPort, selectionPort: ISelectionPort) {
  return create<ISelectionStore>((set, get) => ({
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
