import { Injectable, Inject } from '@nestjs/common';
import {
  IEmailVerificationRepository,
  EMAIL_VERIFICATION_REPOSITORY_TOKEN,
  EmailVerificationEntity,
} from '../repositories/email-verification.repository';
import {
  IContactRepository,
  CONTACT_REPOSITORY_TOKEN,
} from '../../contacts/repositories/contact.repository';
import {
  IEmailVerificationService,
  EMAIL_VERIFICATION_SERVICE_TOKEN,
} from '../services/email-verification.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ContactNotFoundError, ContactAccessDeniedError } from '../domain/verification.errors';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(EMAIL_VERIFICATION_REPOSITORY_TOKEN)
    private readonly verificationRepo: IEmailVerificationRepository,
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
    @Inject(EMAIL_VERIFICATION_SERVICE_TOKEN)
    private readonly emailVerificationService: IEmailVerificationService,
  ) {}

  async execute(
    dto: VerifyEmailDto,
    userId: string,
  ): Promise<EmailVerificationEntity> {
    const contact = await this.contactRepo.findById(dto.contactId);
    if (!contact) {
      throw new ContactNotFoundError(dto.contactId);
    }

    if (contact.userId !== userId) {
      throw new ContactAccessDeniedError();
    }

    const result = await this.emailVerificationService.verifyEmail(dto.email);

    return this.verificationRepo.upsert({
      contactId: dto.contactId,
      email: dto.email,
      isValid: result.isValid,
      smtpCheck: result.smtpCheck,
      catchAll: result.catchAll,
      confidenceScore: result.confidenceScore,
      verifiedAt: new Date(),
    });
  }
}
