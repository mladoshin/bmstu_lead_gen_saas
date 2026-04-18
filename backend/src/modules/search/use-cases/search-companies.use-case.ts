import { Injectable, Inject } from '@nestjs/common';
import {
  ISelectionWriter,
  SELECTION_WRITER_TOKEN,
  SelectionEntity,
} from '../repositories/selection.repository';
import { SearchCompaniesDto } from '../dto/search-companies.dto';

@Injectable()
export class SearchCompaniesUseCase {
  constructor(
    @Inject(SELECTION_WRITER_TOKEN)
    private readonly selectionRepo: ISelectionWriter,
  ) {}

  // Stub: actual implementation will call Google Maps API and LLM enrichment
  async execute(dto: SearchCompaniesDto, userId: string): Promise<SelectionEntity> {
    const name = `${dto.industry} — ${dto.cities.join(', ')}`;

    const selection = await this.selectionRepo.create({
      userId,
      name,
      industry: dto.industry,
      cities: dto.cities,
      companyLimit: dto.companyLimit,
      targetRoles: [],
      status: 'pending',
    });

    return selection;
  }
}
