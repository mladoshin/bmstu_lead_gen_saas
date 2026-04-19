import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { IEmailGenerationService } from './email-generation.service';

function isValidEmailGenerationResult(
  data: unknown,
): data is { email: string; confidence: number } {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.email === 'string' &&
    obj.email.includes('@') &&
    typeof obj.confidence === 'number' &&
    obj.confidence >= 0 &&
    obj.confidence <= 1
  );
}

@Injectable()
export class OpenAIEmailGenerationService implements IEmailGenerationService {
  private readonly logger = new Logger(OpenAIEmailGenerationService.name);
  private client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY is not configured. Email generation will not work.');
    }
    this.client = new OpenAI({ apiKey });
  }

  async generateEmail(
    contact: { firstName: string; lastName: string },
    domain: string,
  ): Promise<{ email: string; confidence: number } | null> {
    const prompt = `You are an email pattern prediction assistant. Predict the most likely professional email address for a person named "${contact.firstName} ${contact.lastName}" at the domain "${domain}".

Consider common corporate email patterns:
- firstname@domain (e.g. john@example.com)
- firstname.lastname@domain (e.g. john.doe@example.com)
- f.lastname@domain (e.g. j.doe@example.com)
- flastname@domain (e.g. jdoe@example.com)
- firstname_lastname@domain (e.g. john_doe@example.com)
- lastname@domain (e.g. doe@example.com)

Return JSON: {"email": "predicted@email.com", "confidence": 0.0-1.0, "pattern": "pattern_used"}
Use lowercase for the email. Return only the single most likely email.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        this.logger.warn(`Empty response from OpenAI for ${contact.firstName} ${contact.lastName}@${domain}`);
        return null;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        this.logger.error(`Failed to parse OpenAI response as JSON: ${content.substring(0, 200)}`);
        return null;
      }

      if (!isValidEmailGenerationResult(parsed)) {
        this.logger.warn(`Invalid email generation result: ${JSON.stringify(parsed)}`);
        return null;
      }

      return { email: parsed.email, confidence: parsed.confidence };
    } catch (err) {
      this.logger.error(
        `Email generation failed for ${contact.firstName} ${contact.lastName}@${domain}: ${(err as Error).message}`,
      );
      return null;
    }
  }
}
