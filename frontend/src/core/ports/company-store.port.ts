import type { Company } from '@/core/entities/company';

export interface ICompanyStore {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
  loadBySelection: (selectionId: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}
