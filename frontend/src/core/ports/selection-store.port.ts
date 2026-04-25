import type { Selection } from '@/core/entities/selection';
import type { SearchCompaniesRequest } from '@/core/types/search.types';

export interface ISelectionStore {
  currentSelection: Selection | null;
  isSearching: boolean;
  error: string | null;
  search: (data: SearchCompaniesRequest) => Promise<void>;
  pollSelection: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
}
