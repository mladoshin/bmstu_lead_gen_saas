import type { BulkVerifyRequest, BulkVerifyResponse } from '../types/verification.types';

export interface IVerificationPort {
  bulkVerify(data: BulkVerifyRequest): Promise<BulkVerifyResponse>;
}
