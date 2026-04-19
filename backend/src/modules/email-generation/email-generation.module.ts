import { Module } from '@nestjs/common';
import { EmailGenerationController } from './email-generation.controller';
import { GenerateEmailsUseCase } from './use-cases/generate-emails.use-case';
import { EmailGenerationMapper } from './mappers/email-generation.mapper';
import { EMAIL_GENERATION_SERVICE_TOKEN } from './services/email-generation.service';
import { OpenAIEmailGenerationService } from './services/openai-email-generation.service';
import { CompaniesModule } from '../companies/companies.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [CompaniesModule, ContactsModule],
  controllers: [EmailGenerationController],
  providers: [
    GenerateEmailsUseCase,
    EmailGenerationMapper,
    { provide: EMAIL_GENERATION_SERVICE_TOKEN, useClass: OpenAIEmailGenerationService },
  ],
})
export class EmailGenerationModule {}
