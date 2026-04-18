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

export interface ISelectionReader {
  findById(id: string): Promise<SelectionEntity | null>;
  findByUserId(userId: string): Promise<SelectionEntity[]>;
}

export interface ISelectionWriter {
  create(data: CreateSelectionData): Promise<SelectionEntity>;
  updateStatus(id: string, status: SelectionStatus): Promise<SelectionEntity>;
  delete(id: string): Promise<void>;
}

export interface ISelectionRepository extends ISelectionReader, ISelectionWriter {}

export const SELECTION_READER_TOKEN = 'ISelectionReader';
export const SELECTION_WRITER_TOKEN = 'ISelectionWriter';
export const SELECTION_REPOSITORY_TOKEN = 'ISelectionRepository';
