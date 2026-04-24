import type { Company } from '../entities/company';

export interface ICompanyPort {
  getCompanies(selectionId?: string): Promise<Company[]>;
}
