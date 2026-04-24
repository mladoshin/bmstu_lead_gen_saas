import { Logger } from '@nestjs/common';
import { GenerateEmailsUseCase } from './generate-emails.use-case';
import { ICompanyRepository, CompanyEntity } from '../../companies/repositories/company.repository';
import { IContactRepository, ContactEntity } from '../../contacts/repositories/contact.repository';
import { IEmailGenerationService } from '../services/email-generation.service';

const makeCompanyRepo = (): jest.Mocked<ICompanyRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySelectionId: jest.fn(),
  findBySelectionIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

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

const makeEmailGenService = (): jest.Mocked<IEmailGenerationService> => ({
  generateEmail: jest.fn(),
});

const makeCompany = (overrides: Partial<CompanyEntity> = {}): CompanyEntity => ({
  id: 'comp-1',
  selectionId: 'sel-1',
  userId: 'user-1',
  name: 'Acme',
  industry: 'IT',
  city: 'Moscow',
  website: null,
  domain: null,
  phone: null,
  emailGeneral: null,
  country: null,
  address: null,
  source: 'google_maps',
  createdAt: new Date(),
  ...overrides,
});

const makeContact = (overrides: Partial<ContactEntity> = {}): ContactEntity => ({
  id: 'contact-1',
  companyId: 'comp-1',
  userId: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  position: 'CEO',
  seniority: 'C-level',
  email: null,
  phone: null,
  linkedin: null,
  telegram: null,
  confidenceScore: 0.9,
  source: 'openai_web_search',
  createdAt: new Date(),
  ...overrides,
});

describe('GenerateEmailsUseCase', () => {
  let useCase: GenerateEmailsUseCase;
  let companyRepo: jest.Mocked<ICompanyRepository>;
  let contactRepo: jest.Mocked<IContactRepository>;
  let emailGenService: jest.Mocked<IEmailGenerationService>;

  beforeEach(() => {
    companyRepo = makeCompanyRepo();
    contactRepo = makeContactRepo();
    emailGenService = makeEmailGenService();
    useCase = new GenerateEmailsUseCase(companyRepo, contactRepo, emailGenService);

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  const dto = { selectionId: 'sel-1' };
  const userId = 'user-1';

  it('should return {processed:0, updated:0} when no companies', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([]);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual({ processed: 0, updated: 0, selectionId: 'sel-1' });
  });

  it('should skip company without domain and without website', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: null, website: null }),
    ]);

    const result = await useCase.execute(dto, userId);

    expect(contactRepo.findByCompanyId).not.toHaveBeenCalled();
    expect(result).toEqual({ processed: 0, updated: 0, selectionId: 'sel-1' });
  });

  it('should use company.domain if set (priority over website)', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: 'acme.com', website: 'https://other.com' }),
    ]);
    contactRepo.findByCompanyId.mockResolvedValue([makeContact()]);
    emailGenService.generateEmail.mockResolvedValue({ email: 'john@acme.com', confidence: 0.9 });
    contactRepo.update.mockResolvedValue(makeContact({ email: 'john@acme.com' }));

    await useCase.execute(dto, userId);

    expect(emailGenService.generateEmail).toHaveBeenCalledWith(
      { firstName: 'John', lastName: 'Doe' },
      'acme.com',
    );
  });

  it('should extract hostname from company.website', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: null, website: 'https://www.example.com/about' }),
    ]);
    contactRepo.findByCompanyId.mockResolvedValue([makeContact()]);
    emailGenService.generateEmail.mockResolvedValue({ email: 'john@example.com', confidence: 0.9 });
    contactRepo.update.mockResolvedValue(makeContact({ email: 'john@example.com' }));

    await useCase.execute(dto, userId);

    expect(emailGenService.generateEmail).toHaveBeenCalledWith(
      { firstName: 'John', lastName: 'Doe' },
      'www.example.com',
    );
  });

  it('should return null from extractDomain for invalid URL', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: null, website: 'not-a-url' }),
    ]);

    const result = await useCase.execute(dto, userId);

    expect(contactRepo.findByCompanyId).not.toHaveBeenCalled();
    expect(result.processed).toBe(0);
  });

  it('should skip contact if email already exists', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: 'acme.com' }),
    ]);
    contactRepo.findByCompanyId.mockResolvedValue([
      makeContact({ email: 'existing@acme.com' }),
    ]);

    const result = await useCase.execute(dto, userId);

    expect(emailGenService.generateEmail).not.toHaveBeenCalled();
    expect(result.processed).toBe(0);
  });

  it('should update contact if generateEmail returns result', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: 'acme.com' }),
    ]);
    contactRepo.findByCompanyId.mockResolvedValue([makeContact()]);
    emailGenService.generateEmail.mockResolvedValue({ email: 'john.doe@acme.com', confidence: 0.85 });
    contactRepo.update.mockResolvedValue(makeContact({ email: 'john.doe@acme.com' }));

    const result = await useCase.execute(dto, userId);

    expect(contactRepo.update).toHaveBeenCalledWith('contact-1', { email: 'john.doe@acme.com' });
    expect(result.updated).toBe(1);
    expect(result.processed).toBe(1);
  });

  it('should not update if generateEmail returns null', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: 'acme.com' }),
    ]);
    contactRepo.findByCompanyId.mockResolvedValue([makeContact()]);
    emailGenService.generateEmail.mockResolvedValue(null);

    const result = await useCase.execute(dto, userId);

    expect(contactRepo.update).not.toHaveBeenCalled();
    expect(result.processed).toBe(1);
    expect(result.updated).toBe(0);
  });

  it('should log error and continue on exception', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ domain: 'acme.com' }),
    ]);
    contactRepo.findByCompanyId.mockResolvedValue([
      makeContact({ id: 'c1', email: null }),
      makeContact({ id: 'c2', email: null, firstName: 'Jane' }),
    ]);
    emailGenService.generateEmail
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce({ email: 'jane@acme.com', confidence: 0.8 });
    contactRepo.update.mockResolvedValue(makeContact({ email: 'jane@acme.com' }));

    const result = await useCase.execute(dto, userId);

    expect(result.processed).toBe(2);
    expect(result.updated).toBe(1);
  });

  it('should correctly count processed and updated across companies', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      makeCompany({ id: 'comp-1', domain: 'a.com' }),
      makeCompany({ id: 'comp-2', domain: 'b.com' }),
    ]);
    contactRepo.findByCompanyId
      .mockResolvedValueOnce([makeContact({ id: 'c1', email: null })])
      .mockResolvedValueOnce([makeContact({ id: 'c2', email: null }), makeContact({ id: 'c3', email: 'exists@b.com' })]);
    emailGenService.generateEmail
      .mockResolvedValueOnce({ email: 'x@a.com', confidence: 0.9 })
      .mockResolvedValueOnce(null);
    contactRepo.update.mockResolvedValue(makeContact());

    const result = await useCase.execute(dto, userId);

    expect(result.processed).toBe(2);
    expect(result.updated).toBe(1);
  });
});
