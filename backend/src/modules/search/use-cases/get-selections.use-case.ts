import { Injectable, Inject } from '@nestjs/common';
import { ISelectionReader, SELECTION_READER_TOKEN, SelectionEntity } from '../repositories/selection.repository';

@Injectable()
export class GetSelectionsUseCase {
  constructor(
    @Inject(SELECTION_READER_TOKEN)
    private readonly selectionRepo: ISelectionReader,
  ) {}

  async execute(userId: string): Promise<SelectionEntity[]> {
    return this.selectionRepo.findByUserId(userId);
  }
}
