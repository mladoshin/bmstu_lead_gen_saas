import type { GenerateEmailsRequest, EmailGenerationResponse } from '../types/email-generation.types';

export interface IEmailGenerationPort {
  generateEmails(data: GenerateEmailsRequest): Promise<EmailGenerationResponse>;
}
