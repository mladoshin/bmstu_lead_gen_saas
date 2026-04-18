import { Injectable, Inject } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN, CompanyEntity } from '../repositories/company.repository';
import { CreateCompanyDto } from '../dto/create-company.dto';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(dto: CreateCompanyDto, userId: string): Promise<CompanyEntity> {
    return this.companyRepo.create({ ...dto, userId });
  }
}
