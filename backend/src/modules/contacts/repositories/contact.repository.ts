export interface ContactEntity {
  id: string;
  companyId: string;
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  seniority?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  telegram?: string | null;
  confidenceScore?: number | null;
  source: string;
  createdAt: Date;
}

export interface CreateContactData {
  companyId: string;
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  seniority?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  telegram?: string;
  confidenceScore?: number;
  source: string;
}

export interface IContactRepository {
  findById(id: string): Promise<ContactEntity | null>;
  findByUserId(userId: string): Promise<ContactEntity[]>;
  findByCompanyId(companyId: string): Promise<ContactEntity[]>;
  findByCompanyIds(companyIds: string[]): Promise<ContactEntity[]>;
  findByCompanyIdAndFullName(companyId: string, firstName: string, lastName: string): Promise<ContactEntity | null>;
  create(data: CreateContactData): Promise<ContactEntity>;
  update(id: string, data: Partial<CreateContactData>): Promise<ContactEntity>;
  findBySelectionId(selectionId: string, userId: string): Promise<ContactEntity[]>;
  delete(id: string): Promise<void>;
}

export const CONTACT_REPOSITORY_TOKEN = 'IContactRepository';
