import type { Selection } from '../entities/selection';

export interface ISelectionPort {
  getSelection(id: string): Promise<Selection>;
}
