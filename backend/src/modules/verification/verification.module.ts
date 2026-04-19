import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { BulkVerifyUseCase } from './use-cases/bulk-verify.use-case';
import { VerificationMapper } from './mappers/verification.mapper';
import { EMAIL_VERIFICATION_REPOSITORY_TOKEN } from './repositories/email-verification.repository';
import { PrismaEmailVerificationRepository } from './repositories/prisma-email-verification.repository';
import { EMAIL_VERIFICATION_SERVICE_TOKEN } from './services/email-verification.service';
import { DnsSmtpEmailVerificationService } from './services/dns-smtp-email-verification.service';
import { CompaniesModule } from '../companies/companies.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [CompaniesModule, ContactsModule],
  controllers: [VerificationController],
  providers: [
    VerifyEmailUseCase,
    BulkVerifyUseCase,
    VerificationMapper,
    { provide: EMAIL_VERIFICATION_REPOSITORY_TOKEN, useClass: PrismaEmailVerificationRepository },
    { provide: EMAIL_VERIFICATION_SERVICE_TOKEN, useClass: DnsSmtpEmailVerificationService },
  ],
})
export class VerificationModule {}
