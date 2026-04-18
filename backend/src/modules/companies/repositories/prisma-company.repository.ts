import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ICompanyRepository,
  CompanyEntity,
  CreateCompanyData,
  UpdateCompanyData,
} from './company.repository';

@Injectable()
export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CompanyEntity | null> {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<CompanyEntity[]> {
    return this.prisma.company.findMany({ where: { userId } });
  }

  async create(data: CreateCompanyData): Promise<CompanyEntity> {
    return this.prisma.company.create({ data });
  }

  async update(id: string, data: UpdateCompanyData): Promise<CompanyEntity> {
    return this.prisma.company.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}
