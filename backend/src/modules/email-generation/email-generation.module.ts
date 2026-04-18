import { Module } from '@nestjs/common';
import { EmailGenerationController } from './email-generation.controller';
import { GenerateEmailsUseCase } from './use-cases/generate-emails.use-case';
import { EmailGenerationMapper } from './mappers/email-generation.mapper';

@Module({
  controllers: [EmailGenerationController],
  providers: [GenerateEmailsUseCase, EmailGenerationMapper],
})
export class EmailGenerationModule {}
