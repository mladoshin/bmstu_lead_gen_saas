import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  ISelectionWriter,
  SELECTION_WRITER_TOKEN,
  SelectionEntity,
} from '../repositories/selection.repository';
import {
  ICompanyRepository,
  COMPANY_REPOSITORY_TOKEN,
} from '../../companies/repositories/company.repository';
import {
  IGooglePlacesService,
  GOOGLE_PLACES_SERVICE_TOKEN,
  GooglePlaceResult,
} from './google-places.service';
import {
  IOpenAIEnrichmentService,
  OPENAI_ENRICHMENT_SERVICE_TOKEN,
  EnrichedCompany,
} from './openai-enrichment.service';
import { SearchCompaniesDto } from '../dto/search-companies.dto';
import { SearchUtils } from '../utils/search.utils';

export interface ISearchJobService {
  enqueue(selection: SelectionEntity, dto: SearchCompaniesDto): void;
}

export const SEARCH_JOB_SERVICE_TOKEN = 'ISearchJobService';

@Injectable()
export class SearchJobService implements ISearchJobService {
  private readonly logger = new Logger(SearchJobService.name);

  constructor(
    @Inject(SELECTION_WRITER_TOKEN)
    private readonly selectionWriter: ISelectionWriter,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(GOOGLE_PLACES_SERVICE_TOKEN)
    private readonly googlePlacesService: IGooglePlacesService,
    @Inject(OPENAI_ENRICHMENT_SERVICE_TOKEN)
    private readonly openAIService: IOpenAIEnrichmentService,
  ) {}

  enqueue(selection: SelectionEntity, dto: SearchCompaniesDto): void {
    setImmediate(() => {
      this.runWithRetry(() => this.runSearchJob(selection, dto), 3).catch(async (err: unknown) => {
        this.logger.error(
          `Search job permanently failed for selection ${selection.id} after all retries: ${(err as Error).message}`,
          (err as Error).stack,
        );
        await this.selectionWriter.updateStatus(selection.id, 'failed').catch(() => undefined);
      });
    });
  }

  private async runWithRetry(fn: () => Promise<void>, maxAttempts: number): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await fn();
        return;
      } catch (err) {
        this.logger.warn(`Attempt ${attempt + 1}/${maxAttempts} failed: ${(err as Error).message}`);
        if (attempt < maxAttempts - 1) {
          await this.delay(100 * Math.pow(2, attempt));
        } else {
          throw err;
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async runSearchJob(selection: SelectionEntity, dto: SearchCompaniesDto): Promise<void> {
    const raw: GooglePlaceResult[] = [];
    for (const city of dto.cities) {
      const places = await this.googlePlacesService.searchPlaces(dto.industry, city);
      raw.push(...places);
    }

    const withDomains = raw.map(c => ({
      ...c,
      domain: c.website ? SearchUtils.extractDomain(c.website) : undefined,
    }));

    const limited = SearchUtils.deduplicate(withDomains).slice(0, dto.companyLimit);

    const enriched: EnrichedCompany[] = [];
    for (let i = 0; i < limited.length; i += 10) {
      const batch = limited.slice(i, i + 10);
      const result = await this.openAIService.enrichCompanies(batch, dto.industry);
      enriched.push(...result);
    }

    for (const company of enriched) {
      await this.companyRepo.create({
        selectionId: selection.id,
        userId: selection.userId,
        name: company.name,
        industry: company.industry,
        city: company.city,
        website: company.website,
        domain: company.domain,
        phone: company.phone,
        address: company.address,
        country: company.country,
        source: 'google_maps',
      });
    }

    await this.selectionWriter.updateStatus(selection.id, 'completed');
  }
}
