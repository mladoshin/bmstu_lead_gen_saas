import { Injectable, Inject, Logger } from '@nestjs/common';
import { IContactRepository, CONTACT_REPOSITORY_TOKEN, ContactEntity } from '../repositories/contact.repository';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN } from '../../companies/repositories/company.repository';
import { IContactDiscoveryService, CONTACT_DISCOVERY_SERVICE_TOKEN } from '../services/contact-discovery.service';
import { DiscoverContactsDto } from '../dto/discover-contacts.dto';

@Injectable()
export class DiscoverContactsUseCase {
  private readonly logger = new Logger(DiscoverContactsUseCase.name);

  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
    @Inject(CONTACT_DISCOVERY_SERVICE_TOKEN)
    private readonly discoveryService: IContactDiscoveryService,
  ) {}

  async execute(dto: DiscoverContactsDto, userId: string): Promise<ContactEntity[]> {
    const companies = await this.companyRepo.findBySelectionId(dto.selectionId);

    if (!companies.length) {
      this.logger.warn(`No companies found for selectionId=${dto.selectionId}`);
      return [];
    }

    const createdContacts: ContactEntity[] = [];

    for (const company of companies) {
      if (company.userId !== userId) {
        continue;
      }
      try {
        const discovered = await this.discoveryService.discoverContacts(
          {
            name: company.name,
            city: company.city,
            website: company.website,
            industry: company.industry,
          },
          dto.targetRoles,
        );

        if (!discovered.length) {
          continue;
        }

        const existingContacts = await this.contactRepo.findByCompanyId(company.id);
        const existingKeys = new Set(
          existingContacts.map((c) => `${c.firstName}\0${c.lastName}`),
        );

        for (const contact of discovered) {
          const key = `${contact.firstName}\0${contact.lastName}`;
          if (existingKeys.has(key)) {
            continue;
          }

          try {
            const created = await this.contactRepo.create({
              companyId: company.id,
              userId,
              firstName: contact.firstName,
              lastName: contact.lastName,
              position: contact.position,
              seniority: contact.seniority,
              email: contact.email,
              phone: contact.phone,
              linkedin: contact.linkedin,
              telegram: contact.telegram,
              confidenceScore: contact.confidenceScore,
              source: 'openai_web_search',
            });

            createdContacts.push(created);
            existingKeys.add(key);
          } catch (createErr) {
            if ((createErr as any)?.code === 'P2002') {
              this.logger.debug(
                `Duplicate contact skipped (unique constraint): ${contact.firstName} ${contact.lastName} for company "${company.name}"`,
              );
            } else {
              throw createErr;
            }
          }
        }
      } catch (err) {
        this.logger.error(
          `Failed to discover contacts for company "${company.name}": ${(err as Error).message}`,
        );
      }
    }

    return createdContacts;
  }
}
