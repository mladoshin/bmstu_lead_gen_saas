import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SearchModule } from './modules/search/search.module';
import { EmailGenerationModule } from './modules/email-generation/email-generation.module';
import { VerificationModule } from './modules/verification/verification.module';
import { ExportModule } from './modules/export/export.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('24h'),
        OPENAI_API_KEY: Joi.string().required(),
        GOOGLE_MAPS_API_KEY: Joi.string().required(),
        PORT: Joi.number().default(3000),
      }),
    }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    ContactsModule,
    SearchModule,
    EmailGenerationModule,
    VerificationModule,
    ExportModule,
    HealthModule,
  ],
})
export class AppModule {}
