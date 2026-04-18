import { Injectable, Inject } from '@nestjs/common';
import {
  IEmailVerificationRepository,
  EMAIL_VERIFICATION_REPOSITORY_TOKEN,
} from '../repositories/email-verification.repository';
import { BulkVerifyDto } from '../dto/bulk-verify.dto';

@Injectable()
export class BulkVerifyUseCase {
  constructor(
    @Inject(EMAIL_VERIFICATION_REPOSITORY_TOKEN)
    private readonly verificationRepo: IEmailVerificationRepository,
  ) {}

  // Stub: actual implementation will bulk-verify all contacts in selection
  async execute(_dto: BulkVerifyDto): Promise<{ processed: number; verified: number }> {
    return { processed: 0, verified: 0 };
  }
}
