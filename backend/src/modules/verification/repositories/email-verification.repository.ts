export interface EmailVerificationEntity {
  id: string;
  contactId: string;
  email: string;
  isValid: boolean;
  smtpCheck?: boolean | null;
  catchAll?: boolean | null;
  confidenceScore?: number | null;
  verifiedAt: Date;
}

export interface CreateEmailVerificationData {
  contactId: string;
  email: string;
  isValid: boolean;
  smtpCheck?: boolean;
  catchAll?: boolean;
  confidenceScore?: number;
  verifiedAt: Date;
}

export interface IEmailVerificationRepository {
  findByContactId(contactId: string): Promise<EmailVerificationEntity | null>;
  upsert(data: CreateEmailVerificationData): Promise<EmailVerificationEntity>;
}

export const EMAIL_VERIFICATION_REPOSITORY_TOKEN = 'IEmailVerificationRepository';
