import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN, CompanyEntity } from '../repositories/company.repository';

@Injectable()
export class GetCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(id: string, userId: string): Promise<CompanyEntity> {
    const company = await this.companyRepo.findById(id);
    if (!company) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    if (company.userId !== userId) {
      throw new ForbiddenException();
    }
    return company;
  }
}
