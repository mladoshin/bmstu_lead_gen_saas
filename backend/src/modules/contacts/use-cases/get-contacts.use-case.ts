import { Injectable, Inject } from '@nestjs/common';
import { IContactRepository, CONTACT_REPOSITORY_TOKEN, ContactEntity } from '../repositories/contact.repository';

@Injectable()
export class GetContactsUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
  ) {}

  async execute(userId: string): Promise<ContactEntity[]> {
    return this.contactRepo.findByUserId(userId);
  }
}
