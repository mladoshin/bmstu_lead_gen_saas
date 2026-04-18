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
    };
  }

  toResponseList(entities: ContactEntity[]): ContactResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
