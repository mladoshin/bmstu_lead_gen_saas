import { Injectable } from '@nestjs/common';
import { SelectionEntity } from '../repositories/selection.repository';
import { SelectionResponseDto } from '../dto/selection-response.dto';

@Injectable()
export class SearchMapper {
  toResponse(entity: SelectionEntity): SelectionResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      industry: entity.industry,
      cities: entity.cities as string[],
      companyLimit: entity.companyLimit,
      targetRoles: entity.targetRoles as string[],
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toResponseList(entities: SelectionEntity[]): SelectionResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
