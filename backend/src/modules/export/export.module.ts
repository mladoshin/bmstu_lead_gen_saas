import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportCompaniesUseCase } from './use-cases/export-companies.use-case';
import { ExportContactsUseCase } from './use-cases/export-contacts.use-case';
import { ExportMapper } from './mappers/export.mapper';
import { CompaniesModule } from '../companies/companies.module';
import { ContactsModule } from '../contacts/contacts.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [CompaniesModule, ContactsModule, SearchModule],
  controllers: [ExportController],
  providers: [ExportCompaniesUseCase, ExportContactsUseCase, ExportMapper],
})
export class ExportModule {}
