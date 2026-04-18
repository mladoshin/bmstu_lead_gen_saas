import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ISelectionRepository,
  SelectionEntity,
  CreateSelectionData,
  SelectionStatus,
} from './selection.repository';

@Injectable()
export class PrismaSelectionRepository implements ISelectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SelectionEntity | null> {
    return this.prisma.selection.findUnique({ where: { id } }) as Promise<SelectionEntity | null>;
  }

  async findByUserId(userId: string): Promise<SelectionEntity[]> {
    return this.prisma.selection.findMany({ where: { userId } }) as Promise<SelectionEntity[]>;
  }

  async create(data: CreateSelectionData): Promise<SelectionEntity> {
    return this.prisma.selection.create({ data }) as Promise<SelectionEntity>;
  }

  async updateStatus(id: string, status: SelectionStatus): Promise<SelectionEntity> {
    return this.prisma.selection.update({ where: { id }, data: { status } }) as Promise<SelectionEntity>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.selection.delete({ where: { id } });
  }
}
