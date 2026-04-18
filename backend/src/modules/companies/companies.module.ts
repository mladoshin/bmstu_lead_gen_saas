import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { GetCompaniesUseCase } from './use-cases/get-companies.use-case';
import { GetCompanyUseCase } from './use-cases/get-company.use-case';
import { CreateCompanyUseCase } from './use-cases/create-company.use-case';
import { UpdateCompanyUseCase } from './use-cases/update-company.use-case';
import { DeleteCompanyUseCase } from './use-cases/delete-company.use-case';
import { CompanyMapper } from './mappers/company.mapper';
import { COMPANY_REPOSITORY_TOKEN } from './repositories/company.repository';
import { PrismaCompanyRepository } from './repositories/prisma-company.repository';

@Module({
  controllers: [CompaniesController],
  providers: [
    GetCompaniesUseCase,
    GetCompanyUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    CompanyMapper,
    { provide: COMPANY_REPOSITORY_TOKEN, useClass: PrismaCompanyRepository },
  ],
  exports: [COMPANY_REPOSITORY_TOKEN],
})
export class CompaniesModule {}
