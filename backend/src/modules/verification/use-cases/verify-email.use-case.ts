import { Injectable, Inject } from '@nestjs/common';
import {
  IEmailVerificationRepository,
  EMAIL_VERIFICATION_REPOSITORY_TOKEN,
  EmailVerificationEntity,
} from '../repositories/email-verification.repository';
import { VerifyEmailDto } from '../dto/verify-email.dto';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(EMAIL_VERIFICATION_REPOSITORY_TOKEN)
    private readonly verificationRepo: IEmailVerificationRepository,
  ) {}

  // Stub: actual implementation will do MX check, SMTP handshake, catch-all detection
  async execute(dto: VerifyEmailDto): Promise<EmailVerificationEntity> {
    return this.verificationRepo.upsert({
      contactId: dto.contactId,
      email: dto.email,
      isValid: false,
      verifiedAt: new Date(),
    });
  }
}
