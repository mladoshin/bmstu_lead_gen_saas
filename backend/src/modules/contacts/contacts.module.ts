import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { GetContactsUseCase } from './use-cases/get-contacts.use-case';
import { GetContactUseCase } from './use-cases/get-contact.use-case';
import { CreateContactUseCase } from './use-cases/create-contact.use-case';
import { UpdateContactUseCase } from './use-cases/update-contact.use-case';
import { DeleteContactUseCase } from './use-cases/delete-contact.use-case';
import { DiscoverContactsUseCase } from './use-cases/discover-contacts.use-case';
import { ContactMapper } from './mappers/contact.mapper';
import { CONTACT_REPOSITORY_TOKEN } from './repositories/contact.repository';
import { PrismaContactRepository } from './repositories/prisma-contact.repository';
import { CONTACT_DISCOVERY_SERVICE_TOKEN } from './services/contact-discovery.service';
import { OpenAIContactDiscoveryService } from './services/contact-discovery.service';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [ContactsController],
  providers: [
    GetContactsUseCase,
    GetContactUseCase,
    CreateContactUseCase,
    UpdateContactUseCase,
    DeleteContactUseCase,
    DiscoverContactsUseCase,
    ContactMapper,
    { provide: CONTACT_REPOSITORY_TOKEN, useClass: PrismaContactRepository },
    { provide: CONTACT_DISCOVERY_SERVICE_TOKEN, useClass: OpenAIContactDiscoveryService },
  ],
  exports: [CONTACT_REPOSITORY_TOKEN],
})
export class ContactsModule {}
