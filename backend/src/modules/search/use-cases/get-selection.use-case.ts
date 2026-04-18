import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ISelectionRepository, SELECTION_REPOSITORY_TOKEN, SelectionEntity } from '../repositories/selection.repository';

@Injectable()
export class GetSelectionUseCase {
  constructor(
    @Inject(SELECTION_REPOSITORY_TOKEN)
    private readonly selectionRepo: ISelectionRepository,
  ) {}

  async execute(id: string): Promise<SelectionEntity> {
    const selection = await this.selectionRepo.findById(id);
    if (!selection) {
      throw new NotFoundException(`Selection ${id} not found`);
    }
    return selection;
  }
}
