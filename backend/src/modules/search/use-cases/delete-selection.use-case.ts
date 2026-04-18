import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  ISelectionReader,
  ISelectionWriter,
  SELECTION_READER_TOKEN,
  SELECTION_WRITER_TOKEN,
} from '../repositories/selection.repository';

@Injectable()
export class DeleteSelectionUseCase {
  constructor(
    @Inject(SELECTION_READER_TOKEN)
    private readonly selectionReader: ISelectionReader,
    @Inject(SELECTION_WRITER_TOKEN)
    private readonly selectionWriter: ISelectionWriter,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const existing = await this.selectionReader.findById(id);
    if (!existing) {
      throw new NotFoundException(`Selection ${id} not found`);
    }
    if (existing.userId !== userId) {
      throw new ForbiddenException();
    }
    await this.selectionWriter.delete(id);
  }
}
