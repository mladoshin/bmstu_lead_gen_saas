import type { AxiosInstance } from 'axios';
import type { IExportPort } from '@/core/ports/export.port';

export class ExportService implements IExportPort {
  constructor(private readonly http: AxiosInstance) {}

  async exportCompaniesCsv(selectionId: string): Promise<Blob> {
    const response = await this.http.get('/export/companies/csv', {
      params: { selectionId },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportContactsCsv(selectionId: string): Promise<Blob> {
    const response = await this.http.get('/export/contacts/csv', {
      params: { selectionId },
      responseType: 'blob',
    });
    return response.data;
  }
}
