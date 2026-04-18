import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICompanyRepository, COMPANY_REPOSITORY_TOKEN } from '../repositories/company.repository';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_TOKEN)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.companyRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException();
    }
    await this.companyRepo.delete(id);
  }
}
