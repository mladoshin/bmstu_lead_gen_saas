import { create } from 'zustand';
import type { ISelectionsListStore } from '@/core/ports/selections-list-store.port';
import type { ISelectionPort } from '@/core/ports/selection.port';
import { normalizeError } from '@/core/utils/normalize-error';

export function createSelectionsListStore(selectionPort: ISelectionPort) {
  return create<ISelectionsListStore>((set, get) => ({
    selections: [],
    isLoading: false,
    error: null,

    loadSelections: async () => {
      set({ isLoading: true, error: null });
      try {
        const selections = await selectionPort.getSelections();
        set({ selections, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

    deleteSelection: async (id: string) => {
      const prev = get().selections;
      set({ selections: prev.filter((s) => s.id !== id) });
      try {
        await selectionPort.deleteSelection(id);
      } catch (err) {
        set({ selections: prev, error: normalizeError(err) });
      }
    },

    reset: () => set({ selections: [], isLoading: false, error: null }),
    clearError: () => set({ error: null }),
  }));
}
