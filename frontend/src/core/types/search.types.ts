export interface SearchCompaniesRequest {
  industry: string;
  cities: string[];
  companyLimit: number;
  targetRoles?: string[];
}
