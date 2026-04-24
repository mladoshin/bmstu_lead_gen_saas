import { GetContactsUseCase } from './get-contacts.use-case';
import { IContactRepository, ContactEntity } from '../repositories/contact.repository';

const makeContactRepo = (): jest.Mocked<IContactRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByCompanyId: jest.fn(),
  findByCompanyIds: jest.fn(),
  findByCompanyIdAndFullName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('GetContactsUseCase', () => {
  let useCase: GetContactsUseCase;
  let contactRepo: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepo = makeContactRepo();
    useCase = new GetContactsUseCase(contactRepo);
  });

  it('returns array of contacts for the given userId', async () => {
    const contacts: ContactEntity[] = [
      {
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
      },
      {
        id: 'contact-2',
        companyId: 'company-2',
        userId: 'user-1',
        firstName: 'Anna',
        lastName: 'Sidorova',
        position: 'CEO',
        seniority: 'C-level',
        email: 'anna@example.com',
        phone: null,
        linkedin: null,
        telegram: null,
        confidenceScore: 0.85,
        source: 'openai_web_search',
        createdAt: new Date(),
      },
    ];

    contactRepo.findByUserId.mockResolvedValue(contacts);

    const result = await useCase.execute('user-1');

    expect(contactRepo.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(contacts);
  });
});
