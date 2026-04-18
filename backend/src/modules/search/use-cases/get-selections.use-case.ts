import { Injectable, Inject } from '@nestjs/common';
import { ISelectionRepository, SELECTION_REPOSITORY_TOKEN, SelectionEntity } from '../repositories/selection.repository';

@Injectable()
export class GetSelectionsUseCase {
  constructor(
    @Inject(SELECTION_REPOSITORY_TOKEN)
    private readonly selectionRepo: ISelectionRepository,
  ) {}

  async execute(userId: string): Promise<SelectionEntity[]> {
    return this.selectionRepo.findByUserId(userId);
  }
}
