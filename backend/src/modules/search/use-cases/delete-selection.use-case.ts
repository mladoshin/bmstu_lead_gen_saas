import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ISelectionRepository, SELECTION_REPOSITORY_TOKEN } from '../repositories/selection.repository';

@Injectable()
export class DeleteSelectionUseCase {
  constructor(
    @Inject(SELECTION_REPOSITORY_TOKEN)
    private readonly selectionRepo: ISelectionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.selectionRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Selection ${id} not found`);
    }
    await this.selectionRepo.delete(id);
  }
}
