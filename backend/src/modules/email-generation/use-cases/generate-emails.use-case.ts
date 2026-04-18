import { Injectable } from '@nestjs/common';
import { GenerateEmailsDto } from '../dto/generate-emails.dto';
import { EmailGenerationResponseDto } from '../dto/email-generation-response.dto';

@Injectable()
export class GenerateEmailsUseCase {
  // Stub: actual implementation will use LLM to predict email patterns per domain
  async execute(dto: GenerateEmailsDto): Promise<EmailGenerationResponseDto> {
    return {
      processed: 0,
      updated: 0,
      selectionId: dto.selectionId,
    };
  }
}
