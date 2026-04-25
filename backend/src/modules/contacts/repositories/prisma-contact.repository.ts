import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IContactRepository, ContactEntity, CreateContactData } from './contact.repository';

@Injectable()
export class PrismaContactRepository implements IContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ContactEntity | null> {
    return this.prisma.contact.findUnique({
      where: { id },
      include: { emailVerification: true },
    });
  }

  async findByUserId(userId: string): Promise<ContactEntity[]> {
    return this.prisma.contact.findMany({
      where: { userId },
      include: { emailVerification: true },
    });
  }

  async findByCompanyId(companyId: string): Promise<ContactEntity[]> {
    return this.prisma.contact.findMany({ where: { companyId } });
  }

  async findByCompanyIds(companyIds: string[]): Promise<ContactEntity[]> {
    return this.prisma.contact.findMany({ where: { companyId: { in: companyIds } } });
  }

  async findBySelectionId(selectionId: string, userId: string): Promise<ContactEntity[]> {
    return this.prisma.contact.findMany({
      where: { userId, company: { selectionId } },
      include: { emailVerification: true },
    });
  }

  async findByCompanyIdAndFullName(companyId: string, firstName: string, lastName: string): Promise<ContactEntity | null> {
    return this.prisma.contact.findFirst({
      where: { companyId, firstName, lastName },
    });
  }

  async create(data: CreateContactData): Promise<ContactEntity> {
    return this.prisma.contact.create({
      data,
      include: { emailVerification: true },
    });
  }

  async update(id: string, data: Partial<CreateContactData>): Promise<ContactEntity> {
    return this.prisma.contact.update({
      where: { id },
      data,
      include: { emailVerification: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contact.delete({ where: { id } });
  }
}
