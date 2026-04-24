import type { Company } from '../entities/company';

export interface ICompanyPort {
  getCompanies(): Promise<Company[]>;
}
