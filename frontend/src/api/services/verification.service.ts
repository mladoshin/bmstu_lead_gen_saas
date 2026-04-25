import type { AxiosInstance } from 'axios';
import type { IVerificationPort } from '@/core/ports/verification.port';
import type { BulkVerifyRequest, BulkVerifyResponse } from '@/core/types/verification.types';

export class VerificationService implements IVerificationPort {
  constructor(private readonly http: AxiosInstance) {}

  async bulkVerify(data: BulkVerifyRequest): Promise<BulkVerifyResponse> {
    const response = await this.http.post<BulkVerifyResponse>('/verification/bulk', data);
    return response.data;
  }
}
