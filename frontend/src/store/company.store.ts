import { create } from 'zustand';
import type { Company } from '@/core/entities/company';
import type { ICompanyPort } from '@/core/ports/company.port';
import { normalizeError } from '@/core/utils/normalize-error';

interface CompanyState {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  loadBySelection: (selectionId: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

export function createCompanyStore(companyPort: ICompanyPort) {
  return create<CompanyState>((set) => ({
    companies: [],
    isLoading: false,
    error: null,

    loadBySelection: async (selectionId) => {
      set({ isLoading: true, error: null });
      try {
        const companies = await companyPort.getCompanies(selectionId);
        set({ companies, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

    reset: () => set({ companies: [], isLoading: false, error: null }),
    clearError: () => set({ error: null }),
  }));
}
