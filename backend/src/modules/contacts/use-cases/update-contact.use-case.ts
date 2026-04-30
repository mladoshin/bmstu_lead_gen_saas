import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IContactRepository,
  CONTACT_REPOSITORY_TOKEN,
  ContactEntity,
} from '../repositories/contact.repository';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class UpdateContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
  ) {}

  async execute(id: string, dto: UpdateContactDto): Promise<ContactEntity> {
    const existing = await this.contactRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Contact ${id} not found`);
    }
    return this.contactRepo.update(id, dto);
  }
}
