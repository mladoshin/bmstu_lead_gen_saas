import { Injectable } from '@nestjs/common';
import { CompanyEntity } from '../repositories/company.repository';
import { CompanyResponseDto } from '../dto/company-response.dto';

@Injectable()
export class CompanyMapper {
  toResponse(entity: CompanyEntity): CompanyResponseDto {
    return {
      id: entity.id,
      selectionId: entity.selectionId,
      userId: entity.userId,
      name: entity.name,
      industry: entity.industry,
      city: entity.city,
      website: entity.website ?? undefined,
      domain: entity.domain ?? undefined,
      phone: entity.phone ?? undefined,
      emailGeneral: entity.emailGeneral ?? undefined,
      country: entity.country ?? undefined,
      address: entity.address ?? undefined,
      source: entity.source,
      createdAt: entity.createdAt,
    };
  }

  toResponseList(entities: CompanyEntity[]): CompanyResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
