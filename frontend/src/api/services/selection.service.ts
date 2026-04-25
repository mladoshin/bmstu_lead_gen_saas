import type { AxiosInstance } from 'axios';
import type { ISelectionPort } from '@/core/ports/selection.port';
import type { Selection } from '@/core/entities/selection';

export class SelectionService implements ISelectionPort {
  constructor(private readonly http: AxiosInstance) {}

  async getSelection(id: string): Promise<Selection> {
    const response = await this.http.get<Selection>(`/selections/${id}`);
    return response.data;
  }

  async getSelections(): Promise<Selection[]> {
    const response = await this.http.get<Selection[]>('/selections');
    return response.data;
  }

  async deleteSelection(id: string): Promise<void> {
    await this.http.delete(`/selections/${id}`);
  }
}
