import { Injectable } from '@nestjs/common';
import { CompanyEntity } from '../../companies/repositories/company.repository';
import { ContactEntity } from '../../contacts/repositories/contact.repository';

@Injectable()
export class ExportMapper {
  companyToRow(entity: CompanyEntity): Record<string, unknown> {
    return {
      id: entity.id,
      name: entity.name,
      industry: entity.industry,
      city: entity.city,
      website: entity.website,
      domain: entity.domain,
      phone: entity.phone,
      email_general: entity.emailGeneral,
      country: entity.country,
      address: entity.address,
      source: entity.source,
    };
  }

  contactToRow(entity: ContactEntity): Record<string, unknown> {
    return {
      id: entity.id,
      first_name: entity.firstName,
      last_name: entity.lastName,
      position: entity.position,
      seniority: entity.seniority,
      email: entity.email,
      phone: entity.phone,
      linkedin: entity.linkedin,
      telegram: entity.telegram,
      confidence_score: entity.confidenceScore,
      source: entity.source,
    };
  }

  toCsv<T extends Record<string, unknown>>(rows: T[], headers: string[]): string {
    const headerLine = headers.join(',');
    const dataLines = rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','),
    );
    return [headerLine, ...dataLines].join('\n');
  }
}
