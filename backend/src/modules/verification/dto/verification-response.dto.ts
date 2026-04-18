export class VerificationResponseDto {
  id: string;
  contactId: string;
  email: string;
  isValid: boolean;
  smtpCheck?: boolean;
  catchAll?: boolean;
  confidenceScore?: number;
  verifiedAt: Date;
}
