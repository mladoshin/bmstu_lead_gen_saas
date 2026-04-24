import type { AxiosInstance } from 'axios';
import type { ICompanyPort } from '@/core/ports/company.port';
import type { Company } from '@/core/entities/company';

export class CompanyService implements ICompanyPort {
  constructor(private readonly http: AxiosInstance) {}

  async getCompanies(): Promise<Company[]> {
    const response = await this.http.get<Company[]>('/companies');
    return response.data;
  }
}
