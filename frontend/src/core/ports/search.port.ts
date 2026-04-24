import type { Selection } from '../entities/selection';
import type { SearchCompaniesRequest } from '../types/search.types';

export interface ISearchPort {
  searchCompanies(data: SearchCompaniesRequest): Promise<Selection>;
}
