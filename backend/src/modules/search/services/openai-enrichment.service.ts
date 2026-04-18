import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface RawCompany {
  name: string;
  website?: string;
  phone?: string;
  address?: string;
  city: string;
  domain?: string;
}

export interface EnrichedCompany extends RawCompany {
  industry: string;
  country?: string;
}

export interface IOpenAIEnrichmentService {
  enrichCompanies(companies: RawCompany[], industry: string): Promise<EnrichedCompany[]>;
}

export const OPENAI_ENRICHMENT_SERVICE_TOKEN = 'IOpenAIEnrichmentService';

function isValidEnrichedCompany(item: unknown): item is EnrichedCompany {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as any).name === 'string' &&
    typeof (item as any).city === 'string' &&
    typeof (item as any).industry === 'string'
  );
}

@Injectable()
export class OpenAIEnrichmentService implements IOpenAIEnrichmentService {
  private readonly logger = new Logger(OpenAIEnrichmentService.name);
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async enrichCompanies(companies: RawCompany[], industry: string): Promise<EnrichedCompany[]> {
    if (!companies.length) return [];

    const prompt = `You are a data enrichment assistant. Given companies from Google Maps for industry "${industry}", return a JSON object {"companies": [...]} where each item MUST include the original "name" field unchanged (it is used as a match key), plus normalized "industry" and extracted "country" from address. Keep all other fields unchanged. Input: ${JSON.stringify(companies)}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content ?? '{"companies":[]}';
      const parsed = JSON.parse(content) as { companies?: unknown[] };
      const result = parsed.companies ?? [];

      const enrichedByName = new Map<string, unknown>();
      for (const item of result) {
        if (isValidEnrichedCompany(item)) {
          enrichedByName.set(item.name, item);
        }
      }

      const merged = companies.map((original) => {
        const enriched = enrichedByName.get(original.name);
        if (!isValidEnrichedCompany(enriched)) {
          this.logger.warn(`No valid enriched entry for company "${original.name}", using original`);
          return { ...original, industry };
        }
        return { ...original, ...enriched };
      });

      return merged;
    } catch (err) {
      this.logger.error(
        `OpenAI enrichment failed for industry "${industry}": ${(err as Error).message}`,
      );
      return companies.map(c => ({ ...c, industry }));
    }
  }
}
