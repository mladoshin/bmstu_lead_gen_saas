import { Inject, Injectable, Logger } from '@nestjs/common';
import { GenerateEmailsDto } from '../dto/generate-emails.dto';
import { EmailGenerationResponseDto } from '../dto/email-generation-response.dto';
import {
  ICompanyRepository,
  COMPANY_REPOSITORY_TOKEN,
  CompanyEntity,
} from '../../companies/repositories/company.repository';
import {
  IContactRepository,
  CONTACT_REPOSITORY_TOKEN,
} from '../../contacts/repositories/contact.repository';
import {
  IEmailGenerationService,
  EMAIL_GENERATION_SERVICE_TOKEN,
} from '../services/email-generation.service';

@Injectable()
export class GenerateEmailsUseCase {
  private readonly logger = new Logger(GenerateEmailsUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
    @Inject(EMAIL_GENERATION_SERVICE_TOKEN)
    private readonly emailGenerationService: IEmailGenerationService,
  ) {}

  async execute(dto: GenerateEmailsDto, userId: string): Promise<EmailGenerationResponseDto> {
    let processed = 0;
    let updated = 0;

    const companies = await this.companyRepo.findBySelectionId(dto.selectionId);

    for (const company of companies) {
      if (company.userId !== userId) {
        continue;
      }

      try {
        const domain = this.extractDomain(company);
        if (!domain) {
          continue;
        }

        const contacts = await this.contactRepo.findByCompanyId(company.id);

        for (const contact of contacts) {
          if (contact.email) {
            continue;
          }

          processed++;

          const result = await this.emailGenerationService.generateEmail(
            { firstName: contact.firstName, lastName: contact.lastName },
            domain,
          );

          if (result) {
            await this.contactRepo.update(contact.id, { email: result.email });
            updated++;
          }
        }
      } catch (err) {
        this.logger.error(
          `Email generation failed for company "${company.name}": ${(err as Error).message}`,
        );
      }
    }

    return { processed, updated, selectionId: dto.selectionId };
  }

  private extractDomain(company: CompanyEntity): string | null {
    if (company.domain) {
      return company.domain;
    }

    if (company.website) {
      try {
        return new URL(company.website).hostname;
      } catch {
        return null;
      }
    }

    return null;
  }
}
