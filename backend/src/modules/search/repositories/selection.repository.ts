export type SelectionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface SelectionEntity {
  id: string;
  userId: string;
  name: string;
  industry: string;
  cities: unknown;
  companyLimit: number;
  targetRoles: unknown;
  status: SelectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSelectionData {
  userId: string;
  name: string;
  industry: string;
  cities: string[];
  companyLimit: number;
  targetRoles: string[];
  status?: SelectionStatus;
}

export interface ISelectionRepository {
  findById(id: string): Promise<SelectionEntity | null>;
  findByUserId(userId: string): Promise<SelectionEntity[]>;
  create(data: CreateSelectionData): Promise<SelectionEntity>;
  updateStatus(id: string, status: SelectionStatus): Promise<SelectionEntity>;
  delete(id: string): Promise<void>;
}

export const SELECTION_REPOSITORY_TOKEN = 'ISelectionRepository';
