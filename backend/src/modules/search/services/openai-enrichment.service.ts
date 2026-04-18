import { Injectable } from '@nestjs/common';
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

@Injectable()
export class OpenAIEnrichmentService implements IOpenAIEnrichmentService {
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async enrichCompanies(companies: RawCompany[], industry: string): Promise<EnrichedCompany[]> {
    if (!companies.length) return [];

    const prompt = `You are a data enrichment assistant. Given companies from Google Maps for industry "${industry}", return a JSON object {"companies": [...]} where each item has the same fields plus normalized "industry" and extracted "country" from address. Keep all other fields unchanged. Input: ${JSON.stringify(companies)}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content ?? '{"companies":[]}';
      const parsed = JSON.parse(content) as { companies?: EnrichedCompany[] };
      const result = parsed.companies ?? [];
      return result.length ? result : companies.map(c => ({ ...c, industry }));
    } catch {
      return companies.map(c => ({ ...c, industry }));
    }
  }
}
