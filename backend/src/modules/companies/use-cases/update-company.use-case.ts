import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN, CompanyEntity } from '../repositories/company.repository';
import { UpdateCompanyDto } from '../dto/update-company.dto';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(id: string, dto: UpdateCompanyDto): Promise<CompanyEntity> {
    const existing = await this.companyRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    return this.companyRepo.update(id, dto);
  }
}
