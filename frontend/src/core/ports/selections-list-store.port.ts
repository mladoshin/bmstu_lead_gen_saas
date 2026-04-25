import type { Selection } from '@/core/entities/selection';

export interface ISelectionsListStore {
  selections: Selection[];
  isLoading: boolean;
  error: string | null;
  loadSelections: () => Promise<void>;
  deleteSelection: (id: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}
