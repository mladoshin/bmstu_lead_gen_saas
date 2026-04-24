import type { AxiosInstance } from 'axios';
import type { ICompanyPort } from '@/core/ports/company.port';
import type { Company } from '@/core/entities/company';

export class CompanyService implements ICompanyPort {
  constructor(private readonly http: AxiosInstance) {}

  async getCompanies(selectionId?: string): Promise<Company[]> {
    const params = selectionId ? { selectionId } : undefined;
    const response = await this.http.get<Company[]>('/companies', { params });
    return response.data;
  }
}
