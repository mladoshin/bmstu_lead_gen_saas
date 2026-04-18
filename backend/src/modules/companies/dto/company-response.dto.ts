export class CompanyResponseDto {
  id: string;
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
  createdAt: Date;
}
