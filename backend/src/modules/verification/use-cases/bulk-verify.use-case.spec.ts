import { Logger } from '@nestjs/common';
import { BulkVerifyUseCase } from './bulk-verify.use-case';
import { IEmailVerificationRepository } from '../repositories/email-verification.repository';
import { ICompanyRepository, CompanyEntity } from '../../companies/repositories/company.repository';
import { IContactRepository, ContactEntity } from '../../contacts/repositories/contact.repository';
import { IEmailVerificationService, EmailVerificationResult } from '../services/email-verification.service';

jest.spyOn(Logger.prototype, 'error').mockImplementation();

describe('BulkVerifyUseCase', () => {
  let useCase: BulkVerifyUseCase;
  let verificationRepo: jest.Mocked<IEmailVerificationRepository>;
  let companyRepo: jest.Mocked<ICompanyRepository>;
  let contactRepo: jest.Mocked<IContactRepository>;
  let emailVerificationService: jest.Mocked<IEmailVerificationService>;

  const userId = 'user-1';
  const selectionId = 'selection-1';

  const makeCompany = (id: string): CompanyEntity => ({
    id,
    selectionId,
    userId,
    name: `Company ${id}`,
    industry: 'IT',
    city: 'Moscow',
    website: null,
    domain: null,
    phone: null,
    emailGeneral: null,
    country: null,
    address: null,
    source: 'ai',
    createdAt: new Date('2025-01-01'),
  });

  const makeContact = (
    id: string,
    companyId: string,
    email: string | null,
  ): ContactEntity => ({
    id,
    companyId,
    userId,
    firstName: 'John',
    lastName: 'Doe',
    position: 'CTO',
    seniority: null,
    email,
    phone: null,
    linkedin: null,
    telegram: null,
    confidenceScore: null,
    source: 'ai',
    createdAt: new Date('2025-01-01'),
  });

  const validResult: EmailVerificationResult = {
    isValid: true,
    mxFound: true,
    smtpCheck: true,
    catchAll: false,
    confidenceScore: 0.95,
  };

  const invalidResult: EmailVerificationResult = {
    isValid: false,
    mxFound: false,
    smtpCheck: false,
    catchAll: false,
    confidenceScore: 0.1,
  };

  beforeEach(() => {
    verificationRepo = {
      findByContactId: jest.fn(),
      upsert: jest.fn().mockResolvedValue({} as any),
    };

    companyRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findBySelectionId: jest.fn(),
      findBySelectionIdAndUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    contactRepo = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByCompanyId: jest.fn(),
      findByCompanyIds: jest.fn(),
      findByCompanyIdAndFullName: jest.fn(),
      findBySelectionId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    emailVerificationService = {
      verifyEmail: jest.fn(),
    };

    useCase = new BulkVerifyUseCase(
      verificationRepo,
      companyRepo,
      contactRepo,
      emailVerificationService,
    );
  });

  it('returns {processed:0, verified:0} when no companies', async () => {
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([]);

    const result = await useCase.execute({ selectionId }, userId);

    expect(result).toEqual({ processed: 0, verified: 0 });
    expect(contactRepo.findByCompanyId).not.toHaveBeenCalled();
    expect(emailVerificationService.verifyEmail).not.toHaveBeenCalled();
  });

  it('skips contact without email', async () => {
    const company = makeCompany('c1');
    const contactNoEmail = makeContact('ct1', 'c1', null);

    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([company]);
    contactRepo.findByCompanyId.mockResolvedValue([contactNoEmail]);

    const result = await useCase.execute({ selectionId }, userId);

    expect(result).toEqual({ processed: 0, verified: 0 });
    expect(emailVerificationService.verifyEmail).not.toHaveBeenCalled();
    expect(verificationRepo.upsert).not.toHaveBeenCalled();
  });

  it('counts verified only when isValid === true', async () => {
    const company = makeCompany('c1');
    const validContact = makeContact('ct1', 'c1', 'valid@example.com');
    const invalidContact = makeContact('ct2', 'c1', 'invalid@example.com');

    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([company]);
    contactRepo.findByCompanyId.mockResolvedValue([validContact, invalidContact]);
    emailVerificationService.verifyEmail
      .mockResolvedValueOnce(validResult)
      .mockResolvedValueOnce(invalidResult);

    const result = await useCase.execute({ selectionId }, userId);

    expect(result).toEqual({ processed: 2, verified: 1 });
  });

  it('logs error and continues on exception', async () => {
    const company = makeCompany('c1');
    const failContact = makeContact('ct1', 'c1', 'fail@example.com');
    const okContact = makeContact('ct2', 'c1', 'ok@example.com');

    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([company]);
    contactRepo.findByCompanyId.mockResolvedValue([failContact, okContact]);
    emailVerificationService.verifyEmail
      .mockRejectedValueOnce(new Error('SMTP timeout'))
      .mockResolvedValueOnce(validResult);

    const result = await useCase.execute({ selectionId }, userId);

    expect(result).toEqual({ processed: 2, verified: 1 });
    expect(Logger.prototype.error).toHaveBeenCalled();
    expect(verificationRepo.upsert).toHaveBeenCalledTimes(1);
  });

  it('correctly counts processed and verified across multiple companies', async () => {
    const company1 = makeCompany('c1');
    const company2 = makeCompany('c2');

    const contacts1 = [
      makeContact('ct1', 'c1', 'a@example.com'),
      makeContact('ct2', 'c1', null),
    ];
    const contacts2 = [
      makeContact('ct3', 'c2', 'b@example.com'),
      makeContact('ct4', 'c2', 'c@example.com'),
    ];

    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([company1, company2]);
    contactRepo.findByCompanyId
      .mockResolvedValueOnce(contacts1)
      .mockResolvedValueOnce(contacts2);
    emailVerificationService.verifyEmail
      .mockResolvedValueOnce(validResult)
      .mockResolvedValueOnce(invalidResult)
      .mockResolvedValueOnce(validResult);

    const result = await useCase.execute({ selectionId }, userId);

    expect(result).toEqual({ processed: 3, verified: 2 });
    expect(emailVerificationService.verifyEmail).toHaveBeenCalledTimes(3);
    expect(verificationRepo.upsert).toHaveBeenCalledTimes(3);
  });
});
