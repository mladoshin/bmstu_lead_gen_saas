import { Injectable } from '@nestjs/common';
import { ExportQueryDto } from '../dto/export-query.dto';

@Injectable()
export class ExportCompaniesUseCase {
  // Stub: actual implementation will query companies by selectionId and generate CSV
  async execute(_dto: ExportQueryDto): Promise<string> {
    return 'id,name,industry,city,website,domain,phone,email_general,country,address,source\n';
  }
}
