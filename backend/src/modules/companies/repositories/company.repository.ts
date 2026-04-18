export interface CompanyEntity {
  id: string;
  selectionId: string;
  userId: string;
  name: string;
  industry: string;
  city: string;
  website?: string | null;
  domain?: string | null;
  phone?: string | null;
  emailGeneral?: string | null;
  country?: string | null;
  address?: string | null;
  source: string;
  createdAt: Date;
}

export interface CreateCompanyData {
  selectionId: string;
  userId: string;
  name: string;
  industry: string;
  city: string;
  website?: string;
  domain?: string;
  phone?: string;
  emailGeneral?: string;
  country?: string;
  address?: string;
  source: string;
}

export interface UpdateCompanyData {
  name?: string;
  industry?: string;
  city?: string;
  website?: string;
  domain?: string;
  phone?: string;
  emailGeneral?: string;
  country?: string;
  address?: string;
}

export interface ICompanyRepository {
  findById(id: string): Promise<CompanyEntity | null>;
  findByUserId(userId: string): Promise<CompanyEntity[]>;
  create(data: CreateCompanyData): Promise<CompanyEntity>;
  update(id: string, data: UpdateCompanyData): Promise<CompanyEntity>;
  delete(id: string): Promise<void>;
}

export const COMPANY_REPOSITORY_TOKEN = 'ICompanyRepository';
