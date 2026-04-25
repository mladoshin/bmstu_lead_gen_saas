import { NotFoundException } from '@nestjs/common';
import { GetContactUseCase } from './get-contact.use-case';
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

describe('GetContactUseCase', () => {
  let useCase: GetContactUseCase;
  let contactRepo: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepo = makeContactRepo();
    useCase = new GetContactUseCase(contactRepo);
  });

  it('returns contact when found', async () => {
    const contact: ContactEntity = {
      id: 'contact-1',
      companyId: 'company-1',
      userId: 'user-1',
      firstName: 'Ivan',
      lastName: 'Petrov',
      position: 'CTO',
      seniority: null,
      email: 'ivan@example.com',
      phone: null,
      linkedin: null,
      telegram: null,
      confidenceScore: 0.9,
      source: 'manual',
      createdAt: new Date(),
    };

    contactRepo.findById.mockResolvedValue(contact);

    const result = await useCase.execute('contact-1');

    expect(contactRepo.findById).toHaveBeenCalledWith('contact-1');
    expect(result).toEqual(contact);
  });

  it('throws NotFoundException when contact not found', async () => {
    contactRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(NotFoundException);
  });
});
