import { Logger } from '@nestjs/common';
import { DiscoverContactsUseCase } from './discover-contacts.use-case';
import { IContactRepository, ContactEntity } from '../repositories/contact.repository';
import { ICompanyRepository, CompanyEntity } from '../../companies/repositories/company.repository';
import { IContactDiscoveryService } from '../services/contact-discovery.service';

jest.spyOn(Logger.prototype, 'warn').mockImplementation();
jest.spyOn(Logger.prototype, 'error').mockImplementation();
jest.spyOn(Logger.prototype, 'debug').mockImplementation();

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

const makeCompanyRepo = (): jest.Mocked<ICompanyRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySelectionId: jest.fn(),
  findBySelectionIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeDiscoveryService = (): jest.Mocked<IContactDiscoveryService> => ({
  discoverContacts: jest.fn(),
});

const makeCompany = (overrides: Partial<CompanyEntity> = {}): CompanyEntity => ({
  id: 'company-1',
  selectionId: 'selection-1',
  userId: 'user-1',
  name: 'Acme Corp',
  industry: 'IT',
  city: 'Moscow',
  website: 'https://acme.com',
  domain: 'acme.com',
  phone: null,
  emailGeneral: null,
  country: 'Russia',
  address: null,
  source: 'openai',
  createdAt: new Date(),
  ...overrides,
});

const makeContactEntity = (overrides: Partial<ContactEntity> = {}): ContactEntity => ({
  id: 'contact-1',
  companyId: 'company-1',
  userId: 'user-1',
  firstName: 'Ivan',
  lastName: 'Petrov',
  position: 'CTO',
  seniority: 'C-level',
  email: 'ivan@acme.com',
  phone: null,
  linkedin: null,
  telegram: null,
  confidenceScore: 0.9,
  source: 'openai_web_search',
  createdAt: new Date(),
  ...overrides,
});

describe('DiscoverContactsUseCase', () => {
  let useCase: DiscoverContactsUseCase;
  let contactRepo: jest.Mocked<IContactRepository>;
  let companyRepo: jest.Mocked<ICompanyRepository>;
  let discoveryService: jest.Mocked<IContactDiscoveryService>;

  const userId = 'user-1';
  const dto = { selectionId: 'selection-1', targetRoles: ['CTO', 'CEO'] };

  beforeEach(() => {
    contactRepo = makeContactRepo();
    companyRepo = makeCompanyRepo();
    discoveryService = makeDiscoveryService();
    useCase = new DiscoverContactsUseCase(contactRepo, companyRepo, discoveryService);
  });

  it('returns [] if no companies found', async () => {
    companyRepo.findBySelectionId.mockResolvedValue([]);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual([]);
    expect(discoveryService.discoverContacts).not.toHaveBeenCalled();
  });

  it('skips companies with wrong userId', async () => {
    const foreignCompany = makeCompany({ userId: 'other-user' });
    companyRepo.findBySelectionId.mockResolvedValue([foreignCompany]);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual([]);
    expect(discoveryService.discoverContacts).not.toHaveBeenCalled();
  });

  it('calls discoveryService with company data and targetRoles', async () => {
    const company = makeCompany();
    companyRepo.findBySelectionId.mockResolvedValue([company]);
    discoveryService.discoverContacts.mockResolvedValue([]);

    await useCase.execute(dto, userId);

    expect(discoveryService.discoverContacts).toHaveBeenCalledWith(
      {
        name: company.name,
        city: company.city,
        website: company.website,
        industry: company.industry,
      },
      dto.targetRoles,
    );
  });

  it('skips if discovery returns []', async () => {
    const company = makeCompany();
    companyRepo.findBySelectionId.mockResolvedValue([company]);
    discoveryService.discoverContacts.mockResolvedValue([]);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual([]);
    expect(contactRepo.create).not.toHaveBeenCalled();
  });

  it('deduplicates by firstName+lastName with existing contacts', async () => {
    const company = makeCompany();
    companyRepo.findBySelectionId.mockResolvedValue([company]);

    const existingContact = makeContactEntity({
      firstName: 'Ivan',
      lastName: 'Petrov',
    });
    contactRepo.findByCompanyId.mockResolvedValue([existingContact]);

    discoveryService.discoverContacts.mockResolvedValue([
      {
        firstName: 'Ivan',
        lastName: 'Petrov',
        position: 'CTO',
        seniority: 'C-level',
        confidenceScore: 0.9,
      },
    ]);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual([]);
    expect(contactRepo.create).not.toHaveBeenCalled();
  });

  it('creates contact with source="openai_web_search"', async () => {
    const company = makeCompany();
    companyRepo.findBySelectionId.mockResolvedValue([company]);
    contactRepo.findByCompanyId.mockResolvedValue([]);

    const discovered = {
      firstName: 'Ivan',
      lastName: 'Petrov',
      position: 'CTO',
      seniority: 'C-level',
      email: 'ivan@acme.com',
      phone: '+79001234567',
      linkedin: 'https://linkedin.com/in/ivan',
      telegram: '@ivan',
      confidenceScore: 0.9,
    };
    discoveryService.discoverContacts.mockResolvedValue([discovered]);

    const created = makeContactEntity();
    contactRepo.create.mockResolvedValue(created);

    await useCase.execute(dto, userId);

    expect(contactRepo.create).toHaveBeenCalledWith({
      companyId: company.id,
      userId,
      firstName: discovered.firstName,
      lastName: discovered.lastName,
      position: discovered.position,
      seniority: discovered.seniority,
      email: discovered.email,
      phone: discovered.phone,
      linkedin: discovered.linkedin,
      telegram: discovered.telegram,
      confidenceScore: discovered.confidenceScore,
      source: 'openai_web_search',
    });
  });

  it('adds key to existingKeys so duplicates within same batch are skipped', async () => {
    const company = makeCompany();
    companyRepo.findBySelectionId.mockResolvedValue([company]);
    contactRepo.findByCompanyId.mockResolvedValue([]);

    discoveryService.discoverContacts.mockResolvedValue([
      {
        firstName: 'Ivan',
        lastName: 'Petrov',
        position: 'CTO',
        seniority: 'C-level',
        confidenceScore: 0.9,
      },
      {
        firstName: 'Ivan',
        lastName: 'Petrov',
        position: 'Director',
        seniority: 'VP',
        confidenceScore: 0.7,
      },
    ]);

    const created = makeContactEntity();
    contactRepo.create.mockResolvedValue(created);

    await useCase.execute(dto, userId);

    expect(contactRepo.create).toHaveBeenCalledTimes(1);
  });

  it('handles P2002 error — skips duplicate silently', async () => {
    const company = makeCompany();
    companyRepo.findBySelectionId.mockResolvedValue([company]);
    contactRepo.findByCompanyId.mockResolvedValue([]);

    discoveryService.discoverContacts.mockResolvedValue([
      {
        firstName: 'Ivan',
        lastName: 'Petrov',
        position: 'CTO',
        seniority: 'C-level',
        confidenceScore: 0.9,
      },
      {
        firstName: 'Anna',
        lastName: 'Sidorova',
        position: 'CEO',
        seniority: 'C-level',
        confidenceScore: 0.85,
      },
    ]);

    const p2002Error = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    contactRepo.create.mockRejectedValueOnce(p2002Error);

    const secondCreated = makeContactEntity({
      id: 'contact-2',
      firstName: 'Anna',
      lastName: 'Sidorova',
    });
    contactRepo.create.mockResolvedValueOnce(secondCreated);

    const result = await useCase.execute(dto, userId);

    expect(contactRepo.create).toHaveBeenCalledTimes(2);
    expect(result).toEqual([secondCreated]);
  });

  it('rethrows non-P2002 error to outer catch (logs and continues)', async () => {
    const company = makeCompany();
    companyRepo.findBySelectionId.mockResolvedValue([company]);
    contactRepo.findByCompanyId.mockResolvedValue([]);

    discoveryService.discoverContacts.mockResolvedValue([
      {
        firstName: 'Ivan',
        lastName: 'Petrov',
        position: 'CTO',
        seniority: 'C-level',
        confidenceScore: 0.9,
      },
    ]);

    const genericError = new Error('DB connection lost');
    contactRepo.create.mockRejectedValue(genericError);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual([]);
  });

  it('logs error from discovery and continues to next company', async () => {
    const company1 = makeCompany({ id: 'company-1', name: 'Acme Corp' });
    const company2 = makeCompany({ id: 'company-2', name: 'Beta Inc' });
    companyRepo.findBySelectionId.mockResolvedValue([company1, company2]);

    discoveryService.discoverContacts
      .mockRejectedValueOnce(new Error('API timeout'))
      .mockResolvedValueOnce([
        {
          firstName: 'Anna',
          lastName: 'Sidorova',
          position: 'CEO',
          seniority: 'C-level',
          confidenceScore: 0.85,
        },
      ]);

    contactRepo.findByCompanyId.mockResolvedValue([]);
    const created = makeContactEntity({
      id: 'contact-2',
      companyId: 'company-2',
      firstName: 'Anna',
      lastName: 'Sidorova',
    });
    contactRepo.create.mockResolvedValue(created);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual([created]);
  });

  it('aggregates results from multiple companies', async () => {
    const company1 = makeCompany({ id: 'company-1', name: 'Acme Corp' });
    const company2 = makeCompany({ id: 'company-2', name: 'Beta Inc' });
    companyRepo.findBySelectionId.mockResolvedValue([company1, company2]);

    discoveryService.discoverContacts
      .mockResolvedValueOnce([
        {
          firstName: 'Ivan',
          lastName: 'Petrov',
          position: 'CTO',
          seniority: 'C-level',
          confidenceScore: 0.9,
        },
      ])
      .mockResolvedValueOnce([
        {
          firstName: 'Anna',
          lastName: 'Sidorova',
          position: 'CEO',
          seniority: 'C-level',
          confidenceScore: 0.85,
        },
      ]);

    contactRepo.findByCompanyId.mockResolvedValue([]);

    const created1 = makeContactEntity({ id: 'contact-1', companyId: 'company-1' });
    const created2 = makeContactEntity({
      id: 'contact-2',
      companyId: 'company-2',
      firstName: 'Anna',
      lastName: 'Sidorova',
    });
    contactRepo.create.mockResolvedValueOnce(created1).mockResolvedValueOnce(created2);

    const result = await useCase.execute(dto, userId);

    expect(result).toEqual([created1, created2]);
    expect(contactRepo.create).toHaveBeenCalledTimes(2);
  });
});
