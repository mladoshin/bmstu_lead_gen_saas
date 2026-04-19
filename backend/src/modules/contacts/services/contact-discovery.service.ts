import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface DiscoveredContact {
  firstName: string;
  lastName: string;
  position: string;
  seniority: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  telegram?: string;
  confidenceScore: number;
}

export interface IContactDiscoveryService {
  discoverContacts(
    company: { name: string; city: string; website?: string | null; industry: string },
    targetRoles: string[],
  ): Promise<DiscoveredContact[]>;
}

export const CONTACT_DISCOVERY_SERVICE_TOKEN = 'IContactDiscoveryService';

const VALID_SENIORITIES = ['C-level', 'VP', 'Director', 'Manager'];

function isValidDiscoveredContact(item: unknown): item is DiscoveredContact {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.firstName === 'string' &&
    obj.firstName.length > 0 &&
    typeof obj.lastName === 'string' &&
    obj.lastName.length > 0 &&
    typeof obj.position === 'string' &&
    (obj.position as string).length > 0 &&
    typeof obj.seniority === 'string' &&
    VALID_SENIORITIES.includes(obj.seniority) &&
    typeof obj.confidenceScore === 'number' &&
    obj.confidenceScore >= 0 &&
    obj.confidenceScore <= 1
  );
}

@Injectable()
export class OpenAIContactDiscoveryService implements IContactDiscoveryService {
  private readonly logger = new Logger(OpenAIContactDiscoveryService.name);
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async discoverContacts(
    company: { name: string; city: string; website?: string | null; industry: string },
    targetRoles: string[],
  ): Promise<DiscoveredContact[]> {
    const prompt = `You are a B2B lead research assistant. Find decision makers at the company "${company.name}" located in ${company.city}, industry: ${company.industry}.
Company website: ${company.website || 'unknown'}.

Search the web for people holding these roles: ${targetRoles.join(', ')}.

For each person found, return:
- firstName, lastName (required)
- position: exact job title
- seniority: classify as exactly one of: "C-level", "VP", "Director", "Manager"
  C-level: CEO, CTO, CFO, COO, CMO, etc.
  VP: Vice President roles
  Director: Director, Senior Manager
  Manager: Manager, Team Lead, Coordinator
- email: professional email if found
- phone: phone number if found
- linkedin: LinkedIn profile URL if found
- telegram: Telegram handle if found
- confidenceScore: 0.0-1.0 how confident you are this person holds this role

Return JSON: {"contacts": [...]}
Only include people with confidenceScore >= 0.3.
If no contacts found, return {"contacts": []}.`;

    try {
      const response = await this.client.responses.create({
        model: 'gpt-4o-mini',
        tools: [{ type: 'web_search_preview' }],
        input: prompt,
        text: { format: { type: 'json_object' } },
      });

      const content = response.output_text;
      const parsed = JSON.parse(content) as { contacts?: unknown[] };
      const rawContacts = parsed.contacts ?? [];

      const validContacts: DiscoveredContact[] = [];
      for (const item of rawContacts) {
        if (isValidDiscoveredContact(item)) {
          validContacts.push(item);
        } else {
          this.logger.warn(`Invalid discovered contact skipped: ${JSON.stringify(item)}`);
        }
      }

      return validContacts;
    } catch (err) {
      this.logger.error(
        `Contact discovery failed for company "${company.name}": ${(err as Error).message}`,
      );
      return [];
    }
  }
}
