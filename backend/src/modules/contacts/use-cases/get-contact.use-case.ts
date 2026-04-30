import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IContactRepository,
  CONTACT_REPOSITORY_TOKEN,
  ContactEntity,
} from '../repositories/contact.repository';

@Injectable()
export class GetContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
  ) {}

  async execute(id: string): Promise<ContactEntity> {
    const contact = await this.contactRepo.findById(id);
    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }
    return contact;
  }
}
