import { NotFoundException } from '@nestjs/common';
import { DeleteContactUseCase } from './delete-contact.use-case';
import { IContactRepository, ContactEntity } from '../repositories/contact.repository';

const makeContactRepo = (): jest.Mocked<IContactRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByCompanyId: jest.fn(),
  findByCompanyIds: jest.fn(),
  findByCompanyIdAndFullName: jest.fn(),
  findBySelectionId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('DeleteContactUseCase', () => {
  let useCase: DeleteContactUseCase;
  let contactRepo: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepo = makeContactRepo();
    useCase = new DeleteContactUseCase(contactRepo);
  });

  it('deletes contact when it exists', async () => {
    const existing: ContactEntity = {
      id: 'contact-1',
      companyId: 'company-1',
      userId: 'user-1',
      firstName: 'Ivan',
      lastName: 'Petrov',
      position: 'CTO',
      seniority: null,
      email: null,
      phone: null,
      linkedin: null,
      telegram: null,
      confidenceScore: null,
      source: 'manual',
      createdAt: new Date(),
    };

    contactRepo.findById.mockResolvedValue(existing);
    contactRepo.delete.mockResolvedValue(undefined);

    await useCase.execute('contact-1');

    expect(contactRepo.findById).toHaveBeenCalledWith('contact-1');
    expect(contactRepo.delete).toHaveBeenCalledWith('contact-1');
  });

  it('throws NotFoundException when contact not found', async () => {
    contactRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);

    expect(contactRepo.delete).not.toHaveBeenCalled();
  });
});
