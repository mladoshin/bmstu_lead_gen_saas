import type { AxiosInstance } from 'axios';
import type { ISearchPort } from '@/core/ports/search.port';
import type { Selection } from '@/core/entities/selection';
import type { SearchCompaniesRequest } from '@/core/types/search.types';

export class SearchService implements ISearchPort {
  constructor(private readonly http: AxiosInstance) {}

  async searchCompanies(data: SearchCompaniesRequest): Promise<Selection> {
    const response = await this.http.post<Selection>('/search/companies', data);
    return response.data;
  }
}
