export interface EmailVerificationResult {
  isValid: boolean;
  mxFound: boolean;
  smtpCheck: boolean;
  catchAll: boolean;
  confidenceScore: number;
}

export interface IEmailVerificationService {
  verifyEmail(email: string): Promise<EmailVerificationResult>;
}

export const EMAIL_VERIFICATION_SERVICE_TOKEN = 'IEmailVerificationService';
