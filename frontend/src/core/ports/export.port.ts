export interface IExportPort {
  exportCompaniesCsv(selectionId: string): Promise<Blob>;
  exportContactsCsv(selectionId: string): Promise<Blob>;
}
