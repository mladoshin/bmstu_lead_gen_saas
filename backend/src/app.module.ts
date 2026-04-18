import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SearchModule } from './modules/search/search.module';
import { EmailGenerationModule } from './modules/email-generation/email-generation.module';
import { VerificationModule } from './modules/verification/verification.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    ContactsModule,
    SearchModule,
    EmailGenerationModule,
    VerificationModule,
    ExportModule,
  ],
})
export class AppModule {}
