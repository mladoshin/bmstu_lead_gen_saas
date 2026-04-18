import { Injectable, Inject } from '@nestjs/common';
import {
  ISelectionWriter,
  SELECTION_WRITER_TOKEN,
  SelectionEntity,
} from '../repositories/selection.repository';
import {
  ISearchJobService,
  SEARCH_JOB_SERVICE_TOKEN,
} from '../services/search-job.service';
import { SearchCompaniesDto } from '../dto/search-companies.dto';

@Injectable()
export class SearchCompaniesUseCase {
  constructor(
    @Inject(SELECTION_WRITER_TOKEN)
    private readonly selectionRepo: ISelectionWriter,
    @Inject(SEARCH_JOB_SERVICE_TOKEN)
    private readonly searchJobService: ISearchJobService,
  ) {}

  async execute(dto: SearchCompaniesDto, userId: string): Promise<SelectionEntity> {
    const name = `${dto.industry} — ${dto.cities.join(', ')}`;
    const selection = await this.selectionRepo.create({
      userId,
      name,
      industry: dto.industry,
      cities: dto.cities,
      companyLimit: dto.companyLimit,
      targetRoles: dto.targetRoles ?? [],
      status: 'in_progress',
    });

    this.searchJobService.enqueue(selection, dto);
    return selection;
  }
}
