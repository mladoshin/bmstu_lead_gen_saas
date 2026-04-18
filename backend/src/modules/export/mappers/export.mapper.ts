import { Injectable } from '@nestjs/common';

@Injectable()
export class ExportMapper {
  toCsv<T extends Record<string, unknown>>(rows: T[], headers: string[]): string {
    const headerLine = headers.join(',');
    const dataLines = rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? '')}"`).join(','),
    );
    return [headerLine, ...dataLines].join('\n');
  }
}
