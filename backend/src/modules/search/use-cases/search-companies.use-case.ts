import { Injectable, Inject } from '@nestjs/common';
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
} from '../services/google-places.service';
import {
  IOpenAIEnrichmentService,
  OPENAI_ENRICHMENT_SERVICE_TOKEN,
  EnrichedCompany,
} from '../services/openai-enrichment.service';
import { SearchCompaniesDto } from '../dto/search-companies.dto';

@Injectable()
export class SearchCompaniesUseCase {
  constructor(
    @Inject(SELECTION_WRITER_TOKEN)
    private readonly selectionRepo: ISelectionWriter,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(GOOGLE_PLACES_SERVICE_TOKEN)
    private readonly googlePlacesService: IGooglePlacesService,
    @Inject(OPENAI_ENRICHMENT_SERVICE_TOKEN)
    private readonly openAIService: IOpenAIEnrichmentService,
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

    setImmediate(() => {
      this.runSearchJob(selection, dto).catch(async () => {
        await this.selectionRepo.updateStatus(selection.id, 'failed').catch(() => undefined);
      });
    });

    return selection;
  }

  private async runSearchJob(selection: SelectionEntity, dto: SearchCompaniesDto): Promise<void> {
    const raw: GooglePlaceResult[] = [];
    for (const city of dto.cities) {
      const places = await this.googlePlacesService.searchPlaces(dto.industry, city);
      raw.push(...places);
    }

    const withDomains = raw.map(c => ({
      ...c,
      domain: c.website ? this.extractDomain(c.website) : undefined,
    }));

    const limited = this.deduplicate(withDomains).slice(0, dto.companyLimit);

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

    await this.selectionRepo.updateStatus(selection.id, 'completed');
  }

  private extractDomain(url: string): string | undefined {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return undefined;
    }
  }

  private deduplicate<T extends { domain?: string; name: string; city: string }>(items: T[]): T[] {
    const seen = new Set<string>();
    return items.filter(c => {
      const key = c.domain ?? `${c.name}|${c.city}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
