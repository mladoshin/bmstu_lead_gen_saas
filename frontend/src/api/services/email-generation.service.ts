import type { AxiosInstance } from 'axios';
import type { IEmailGenerationPort } from '@/core/ports/email-generation.port';
import type { GenerateEmailsRequest, EmailGenerationResponse } from '@/core/types/email-generation.types';

export class EmailGenerationService implements IEmailGenerationPort {
  constructor(private readonly http: AxiosInstance) {}

  async generateEmails(data: GenerateEmailsRequest): Promise<EmailGenerationResponse> {
    const response = await this.http.post<EmailGenerationResponse>('/email/generate', data);
    return response.data;
  }
}
