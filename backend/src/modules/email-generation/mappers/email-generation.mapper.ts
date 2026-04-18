import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailGenerationMapper {
  toResponse(processed: number, updated: number, selectionId: string) {
    return { processed, updated, selectionId };
  }
}
