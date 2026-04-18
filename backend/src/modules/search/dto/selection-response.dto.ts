export class SelectionResponseDto {
  id: string;
  userId: string;
  name: string;
  industry: string;
  cities: string[];
  companyLimit: number;
  targetRoles: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
