import { create } from 'zustand';
import type { ICompanyStore } from '@/core/ports/company-store.port';
import type { ICompanyPort } from '@/core/ports/company.port';
import { normalizeError } from '@/core/utils/normalize-error';

export function createCompanyStore(companyPort: ICompanyPort) {
  return create<ICompanyStore>((set) => ({
    companies: [],
    isLoading: false,
    error: null,

    loadAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const companies = await companyPort.getCompanies();
        set({ companies, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

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
