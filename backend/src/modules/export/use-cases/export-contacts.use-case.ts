import { Injectable } from '@nestjs/common';
import { ExportQueryDto } from '../dto/export-query.dto';

@Injectable()
export class ExportContactsUseCase {
  // Stub: actual implementation will query contacts by selectionId and generate CSV
  async execute(_dto: ExportQueryDto): Promise<string> {
    return 'id,first_name,last_name,position,seniority,email,phone,linkedin,telegram,confidence_score,source\n';
  }
}
