import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IContactRepository, CONTACT_REPOSITORY_TOKEN } from '../repositories/contact.repository';

@Injectable()
export class DeleteContactUseCase {
  constructor(
    @Inject(CONTACT_REPOSITORY_TOKEN)
    private readonly contactRepo: IContactRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.contactRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Contact ${id} not found`);
    }
    await this.contactRepo.delete(id);
  }
}
