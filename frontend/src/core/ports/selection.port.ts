import type { Selection } from '../entities/selection';

export interface ISelectionPort {
  getSelection(id: string): Promise<Selection>;
  getSelections(): Promise<Selection[]>;
  deleteSelection(id: string): Promise<void>;
}
