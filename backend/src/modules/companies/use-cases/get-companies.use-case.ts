import { Injectable, Inject } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN, CompanyEntity } from '../repositories/company.repository';

@Injectable()
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(userId: string, selectionId?: string): Promise<CompanyEntity[]> {
    if (selectionId) {
      return this.companyRepo.findBySelectionIdAndUserId(selectionId, userId);
    }
    return this.companyRepo.findByUserId(userId);
  }
}
