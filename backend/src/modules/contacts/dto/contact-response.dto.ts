export class ContactResponseDto {
  id: string;
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
  createdAt: Date;
}
