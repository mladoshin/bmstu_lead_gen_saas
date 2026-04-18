import { Injectable } from '@nestjs/common';
import { EmailVerificationEntity } from '../repositories/email-verification.repository';
import { VerificationResponseDto } from '../dto/verification-response.dto';

@Injectable()
export class VerificationMapper {
  toResponse(entity: EmailVerificationEntity): VerificationResponseDto {
    return {
      id: entity.id,
      contactId: entity.contactId,
      email: entity.email,
      isValid: entity.isValid,
      smtpCheck: entity.smtpCheck ?? undefined,
      catchAll: entity.catchAll ?? undefined,
      confidenceScore: entity.confidenceScore ?? undefined,
      verifiedAt: entity.verifiedAt,
    };
  }
}
