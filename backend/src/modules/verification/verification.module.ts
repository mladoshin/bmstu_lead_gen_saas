import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { BulkVerifyUseCase } from './use-cases/bulk-verify.use-case';
import { VerificationMapper } from './mappers/verification.mapper';
import { EMAIL_VERIFICATION_REPOSITORY_TOKEN } from './repositories/email-verification.repository';
import { PrismaEmailVerificationRepository } from './repositories/prisma-email-verification.repository';

@Module({
  controllers: [VerificationController],
  providers: [
    VerifyEmailUseCase,
    BulkVerifyUseCase,
    VerificationMapper,
    { provide: EMAIL_VERIFICATION_REPOSITORY_TOKEN, useClass: PrismaEmailVerificationRepository },
  ],
})
export class VerificationModule {}
