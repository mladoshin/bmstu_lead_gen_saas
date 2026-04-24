export type SelectionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Selection {
  id: string;
  userId: string;
  name: string;
  industry: string;
  cities: string[];
  companyLimit: number;
  targetRoles: string[];
  status: SelectionStatus;
  createdAt: string;
  updatedAt: string;
}
