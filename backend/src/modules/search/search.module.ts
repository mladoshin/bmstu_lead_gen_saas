import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchController } from './search.controller';
import { SelectionsController } from './selections.controller';
import { SearchCompaniesUseCase } from './use-cases/search-companies.use-case';
import { GetSelectionsUseCase } from './use-cases/get-selections.use-case';
import { GetSelectionUseCase } from './use-cases/get-selection.use-case';
import { DeleteSelectionUseCase } from './use-cases/delete-selection.use-case';
import { SearchMapper } from './mappers/search.mapper';
import {
  SELECTION_READER_TOKEN,
  SELECTION_WRITER_TOKEN,
} from './repositories/selection.repository';
import { PrismaSelectionRepository } from './repositories/prisma-selection.repository';
import {
  GOOGLE_PLACES_SERVICE_TOKEN,
  GooglePlacesService,
} from './services/google-places.service';
import {
  OPENAI_ENRICHMENT_SERVICE_TOKEN,
  OpenAIEnrichmentService,
} from './services/openai-enrichment.service';
import {
  SEARCH_JOB_SERVICE_TOKEN,
  SearchJobService,
} from './services/search-job.service';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [HttpModule.register({ timeout: 10_000 }), CompaniesModule],
  controllers: [SearchController, SelectionsController],
  providers: [
    SearchCompaniesUseCase,
    GetSelectionsUseCase,
    GetSelectionUseCase,
    DeleteSelectionUseCase,
    SearchMapper,
    { provide: SELECTION_READER_TOKEN, useClass: PrismaSelectionRepository },
    { provide: SELECTION_WRITER_TOKEN, useClass: PrismaSelectionRepository },
    { provide: GOOGLE_PLACES_SERVICE_TOKEN, useClass: GooglePlacesService },
    { provide: OPENAI_ENRICHMENT_SERVICE_TOKEN, useClass: OpenAIEnrichmentService },
    { provide: SEARCH_JOB_SERVICE_TOKEN, useClass: SearchJobService },
  ],
  exports: [SELECTION_READER_TOKEN, SELECTION_WRITER_TOKEN],
})
export class SearchModule {}
