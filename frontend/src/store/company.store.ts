import { create } from 'zustand';
import type { Company } from '@/core/entities/company';
import type { ICompanyPort } from '@/core/ports/company.port';
import type { ApiError } from '@/core/types/auth.types';
import { AxiosError } from 'axios';

interface CompanyState {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  loadBySelection: (selectionId: string) => Promise<void>;
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

export function createCompanyStore(companyPort: ICompanyPort) {
  return create<CompanyState>((set) => ({
    companies: [],
    isLoading: false,
    error: null,

    loadBySelection: async (selectionId) => {
      set({ isLoading: true, error: null });
      try {
        const all = await companyPort.getCompanies();
        const filtered = all.filter((c) => c.selectionId === selectionId);
        set({ companies: filtered, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: normalizeError(err) });
      }
    },

    reset: () => set({ companies: [], isLoading: false, error: null }),
    clearError: () => set({ error: null }),
  }));
}
