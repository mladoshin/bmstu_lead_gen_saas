export interface EmailVerification {
  id: string;
  isValid: boolean;
  smtpCheck?: boolean;
  catchAll?: boolean;
  confidenceScore?: number;
  verifiedAt: string;
}

export interface Contact {
  id: string;
  companyId: string;
  userId: string;
  firstName: string;
  lastName: string;
  position: string;
  seniority: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  telegram: string | null;
  confidenceScore: number | null;
  source: string;
  createdAt: string;
  emailVerification?: EmailVerification | null;
}
