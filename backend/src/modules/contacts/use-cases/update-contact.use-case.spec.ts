import { NotFoundException } from '@nestjs/common';
import { UpdateContactUseCase } from './update-contact.use-case';
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

describe('UpdateContactUseCase', () => {
  let useCase: UpdateContactUseCase;
  let contactRepo: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepo = makeContactRepo();
    useCase = new UpdateContactUseCase(contactRepo);
  });

  it('updates contact when it exists', async () => {
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

    const updated: ContactEntity = {
      ...existing,
      email: 'ivan@example.com',
      phone: '+79001234567',
    };

    const dto = { email: 'ivan@example.com', phone: '+79001234567' };

    contactRepo.findById.mockResolvedValue(existing);
    contactRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('contact-1', dto);

    expect(contactRepo.findById).toHaveBeenCalledWith('contact-1');
    expect(contactRepo.update).toHaveBeenCalledWith('contact-1', dto);
    expect(result).toEqual(updated);
  });

  it('throws NotFoundException when contact not found', async () => {
    contactRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', { email: 'test@example.com' })).rejects.toThrow(
      NotFoundException,
    );

    expect(contactRepo.update).not.toHaveBeenCalled();
  });
});
