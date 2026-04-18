import { Injectable, Inject } from '@nestjs/common';
import { IContactRepository, CONTACT_REPOSITORY_TOKEN, ContactEntity } from '../repositories/contact.repository';
import { DiscoverContactsDto } from '../dto/discover-contacts.dto';

@Injectable()
export class DiscoverContactsUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
  ) {}

  // Stub: actual implementation will use LLM web search to find decision makers
  async execute(_dto: DiscoverContactsDto, _userId: string): Promise<ContactEntity[]> {
    return [];
  }
}
