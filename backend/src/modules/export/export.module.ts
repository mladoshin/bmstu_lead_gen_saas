import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportCompaniesUseCase } from './use-cases/export-companies.use-case';
import { ExportContactsUseCase } from './use-cases/export-contacts.use-case';
import { ExportMapper } from './mappers/export.mapper';

@Module({
  controllers: [ExportController],
  providers: [ExportCompaniesUseCase, ExportContactsUseCase, ExportMapper],
})
export class ExportModule {}
