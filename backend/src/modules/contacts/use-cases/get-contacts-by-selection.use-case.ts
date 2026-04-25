import { Injectable, Inject } from '@nestjs/common';
import { IContactRepository, CONTACT_REPOSITORY_TOKEN, ContactEntity } from '../repositories/contact.repository';

@Injectable()
export class GetContactsBySelectionUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
  ) {}

  async execute(selectionId: string, userId: string): Promise<ContactEntity[]> {
    return this.contactRepo.findBySelectionId(selectionId, userId);
  }
}
