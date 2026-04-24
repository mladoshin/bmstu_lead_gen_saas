import { CreateContactUseCase } from './create-contact.use-case';
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

describe('CreateContactUseCase', () => {
  let useCase: CreateContactUseCase;
  let contactRepo: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    contactRepo = makeContactRepo();
    useCase = new CreateContactUseCase(contactRepo);
  });

  it('delegates create with dto + userId', async () => {
    const dto = {
      companyId: 'company-1',
      firstName: 'Ivan',
      lastName: 'Petrov',
      position: 'CTO',
      source: 'manual',
    };
    const userId = 'user-1';

    const expected: ContactEntity = {
      id: 'contact-1',
      companyId: 'company-1',
      userId,
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

    contactRepo.create.mockResolvedValue(expected);

    const result = await useCase.execute(dto, userId);

    expect(contactRepo.create).toHaveBeenCalledWith({ ...dto, userId });
    expect(result).toEqual(expected);
  });
});
