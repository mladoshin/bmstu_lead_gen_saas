import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IEmailVerificationRepository,
  EmailVerificationEntity,
  CreateEmailVerificationData,
} from './email-verification.repository';

@Injectable()
export class PrismaEmailVerificationRepository implements IEmailVerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByContactId(contactId: string): Promise<EmailVerificationEntity | null> {
    return this.prisma.emailVerification.findUnique({ where: { contactId } });
  }

  async upsert(data: CreateEmailVerificationData): Promise<EmailVerificationEntity> {
    return this.prisma.emailVerification.upsert({
      where: { contactId: data.contactId },
      create: data,
      update: {
        email: data.email,
        isValid: data.isValid,
        smtpCheck: data.smtpCheck,
        catchAll: data.catchAll,
        confidenceScore: data.confidenceScore,
        verifiedAt: data.verifiedAt,
      },
    });
  }
}
