import { Injectable, Inject } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN, CompanyEntity } from '../repositories/company.repository';

@Injectable()
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(userId: string): Promise<CompanyEntity[]> {
    return this.companyRepo.findByUserId(userId);
  }
}
