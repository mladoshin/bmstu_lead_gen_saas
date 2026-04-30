import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  ISelectionReader,
  SELECTION_READER_TOKEN,
  SelectionEntity,
} from '../repositories/selection.repository';

@Injectable()
export class GetSelectionUseCase {
  constructor(
    @Inject(SELECTION_READER_TOKEN)
    private readonly selectionRepo: ISelectionReader,
  ) {}

  async execute(id: string, userId: string): Promise<SelectionEntity> {
    const selection = await this.selectionRepo.findById(id);
    if (!selection) {
      throw new NotFoundException(`Selection ${id} not found`);
    }
    if (selection.userId !== userId) {
      throw new ForbiddenException();
    }
    return selection;
  }
}
