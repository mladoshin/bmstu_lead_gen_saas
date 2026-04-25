import { Injectable } from '@nestjs/common';
import { ContactEntity } from '../repositories/contact.repository';
import { ContactResponseDto } from '../dto/contact-response.dto';

@Injectable()
export class ContactMapper {
  toResponse(entity: ContactEntity): ContactResponseDto {
    return {
      id: entity.id,
      companyId: entity.companyId,
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      position: entity.position,
      seniority: entity.seniority ?? undefined,
      email: entity.email ?? undefined,
      phone: entity.phone ?? undefined,
      linkedin: entity.linkedin ?? undefined,
      telegram: entity.telegram ?? undefined,
      confidenceScore: entity.confidenceScore ?? undefined,
      source: entity.source,
      createdAt: entity.createdAt,
      emailVerification: entity.emailVerification
        ? {
            id: entity.emailVerification.id,
            isValid: entity.emailVerification.isValid,
            smtpCheck: entity.emailVerification.smtpCheck ?? undefined,
            catchAll: entity.emailVerification.catchAll ?? undefined,
            confidenceScore: entity.emailVerification.confidenceScore ?? undefined,
            verifiedAt: entity.emailVerification.verifiedAt,
          }
        : undefined,
    };
  }

  toResponseList(entities: ContactEntity[]): ContactResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
