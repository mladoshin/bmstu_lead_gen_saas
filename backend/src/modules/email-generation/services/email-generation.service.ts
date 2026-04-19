export interface IEmailGenerationService {
  generateEmail(
    contact: { firstName: string; lastName: string },
    domain: string,
  ): Promise<{ email: string; confidence: number } | null>;
}

export const EMAIL_GENERATION_SERVICE_TOKEN = 'IEmailGenerationService';
