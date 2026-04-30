import { Injectable, Inject } from '@nestjs/common';
import {
  IContactRepository,
  CONTACT_REPOSITORY_TOKEN,
  ContactEntity,
} from '../repositories/contact.repository';
import { CreateContactDto } from '../dto/create-contact.dto';

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
  ) {}

  async execute(dto: CreateContactDto, userId: string): Promise<ContactEntity> {
    return this.contactRepo.create({ ...dto, userId });
  }
}
