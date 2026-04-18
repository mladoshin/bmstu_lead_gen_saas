import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SelectionsController } from './selections.controller';
import { SearchCompaniesUseCase } from './use-cases/search-companies.use-case';
import { GetSelectionsUseCase } from './use-cases/get-selections.use-case';
import { GetSelectionUseCase } from './use-cases/get-selection.use-case';
import { DeleteSelectionUseCase } from './use-cases/delete-selection.use-case';
import { SearchMapper } from './mappers/search.mapper';
import {
  SELECTION_REPOSITORY_TOKEN,
  SELECTION_READER_TOKEN,
  SELECTION_WRITER_TOKEN,
} from './repositories/selection.repository';
import { PrismaSelectionRepository } from './repositories/prisma-selection.repository';

@Module({
  controllers: [SearchController, SelectionsController],
  providers: [
    SearchCompaniesUseCase,
    GetSelectionsUseCase,
    GetSelectionUseCase,
    DeleteSelectionUseCase,
    SearchMapper,
    { provide: SELECTION_REPOSITORY_TOKEN, useClass: PrismaSelectionRepository },
    { provide: SELECTION_READER_TOKEN, useClass: PrismaSelectionRepository },
    { provide: SELECTION_WRITER_TOKEN, useClass: PrismaSelectionRepository },
  ],
})
export class SearchModule {}
