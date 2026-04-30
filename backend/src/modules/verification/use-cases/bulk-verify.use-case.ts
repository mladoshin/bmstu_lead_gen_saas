import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IEmailVerificationRepository,
  EMAIL_VERIFICATION_REPOSITORY_TOKEN,
} from '../repositories/email-verification.repository';
import {
  ICompanyRepository,
  COMPANY_REPOSITORY_TOKEN,
} from '../../companies/repositories/company.repository';
import {
  IContactRepository,
  CONTACT_REPOSITORY_TOKEN,
} from '../../contacts/repositories/contact.repository';
import {
  IEmailVerificationService,
  EMAIL_VERIFICATION_SERVICE_TOKEN,
} from '../services/email-verification.service';
import { BulkVerifyDto } from '../dto/bulk-verify.dto';

@Injectable()
export class BulkVerifyUseCase {
  private readonly logger = new Logger(BulkVerifyUseCase.name);

  constructor(
    @Inject(EMAIL_VERIFICATION_REPOSITORY_TOKEN)
    private readonly verificationRepo: IEmailVerificationRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
    @Inject(EMAIL_VERIFICATION_SERVICE_TOKEN)
    private readonly emailVerificationService: IEmailVerificationService,
  ) {}

  async execute(
    dto: BulkVerifyDto,
    userId: string,
  ): Promise<{ processed: number; verified: number }> {
    let processed = 0;
    let verified = 0;

    const companies = await this.companyRepo.findBySelectionIdAndUserId(dto.selectionId, userId);

    for (const company of companies) {
      const contacts = await this.contactRepo.findByCompanyId(company.id);

      for (const contact of contacts) {
        if (!contact.email) {
          continue;
        }

        processed++;

        try {
          const result = await this.emailVerificationService.verifyEmail(contact.email);

          await this.verificationRepo.upsert({
            contactId: contact.id,
            email: contact.email,
            isValid: result.isValid,
            smtpCheck: result.smtpCheck,
            catchAll: result.catchAll,
            confidenceScore: result.confidenceScore,
            verifiedAt: new Date(),
          });

          if (result.isValid) {
            verified++;
          }
        } catch (err) {
          this.logger.error(
            `Email verification failed for contact "${contact.firstName} ${contact.lastName}": ${(err as Error).message}`,
          );
        }
      }
    }

    return { processed, verified };
  }
}
