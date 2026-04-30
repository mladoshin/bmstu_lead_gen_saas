import { VerifyEmailUseCase } from './verify-email.use-case';
import {
  IEmailVerificationRepository,
  EmailVerificationEntity,
} from '../repositories/email-verification.repository';
import { IContactRepository, ContactEntity } from '../../contacts/repositories/contact.repository';
import {
  IEmailVerificationService,
  EmailVerificationResult,
} from '../services/email-verification.service';
import { ContactNotFoundError, ContactAccessDeniedError } from '../domain/verification.errors';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let verificationRepo: jest.Mocked<IEmailVerificationRepository>;
  let contactRepo: jest.Mocked<IContactRepository>;
  let emailVerificationService: jest.Mocked<IEmailVerificationService>;

  const userId = 'user-1';
  const contactId = 'contact-1';
  const email = 'john@example.com';

  const contact: ContactEntity = {
    id: contactId,
    companyId: 'company-1',
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
  };

  const verificationResult: EmailVerificationResult = {
    isValid: true,
    mxFound: true,
    smtpCheck: true,
    catchAll: false,
    confidenceScore: 0.95,
  };

  const savedEntity: EmailVerificationEntity = {
    id: 'ver-1',
    contactId,
    email,
    isValid: true,
    smtpCheck: true,
    catchAll: false,
    confidenceScore: 0.95,
    verifiedAt: new Date('2025-06-01'),
  };

  beforeEach(() => {
    verificationRepo = {
      findByContactId: jest.fn(),
      upsert: jest.fn(),
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

    useCase = new VerifyEmailUseCase(verificationRepo, contactRepo, emailVerificationService);
  });

  it('verifies email and saves via upsert', async () => {
    contactRepo.findById.mockResolvedValue(contact);
    emailVerificationService.verifyEmail.mockResolvedValue(verificationResult);
    verificationRepo.upsert.mockResolvedValue(savedEntity);

    const result = await useCase.execute({ contactId, email }, userId);

    expect(contactRepo.findById).toHaveBeenCalledWith(contactId);
    expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith(email);
    expect(verificationRepo.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        contactId,
        email,
        isValid: true,
        smtpCheck: true,
        catchAll: false,
        confidenceScore: 0.95,
      }),
    );
    expect(result).toEqual(savedEntity);
  });

  it('throws ContactNotFoundError when contact not found', async () => {
    contactRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute({ contactId, email }, userId)).rejects.toThrow(
      ContactNotFoundError,
    );

    expect(emailVerificationService.verifyEmail).not.toHaveBeenCalled();
    expect(verificationRepo.upsert).not.toHaveBeenCalled();
  });

  it('throws ContactAccessDeniedError when userId does not match', async () => {
    contactRepo.findById.mockResolvedValue(contact);

    await expect(useCase.execute({ contactId, email }, 'other-user')).rejects.toThrow(
      ContactAccessDeniedError,
    );

    expect(emailVerificationService.verifyEmail).not.toHaveBeenCalled();
    expect(verificationRepo.upsert).not.toHaveBeenCalled();
  });

  it('passes verifiedAt as Date in upsert', async () => {
    contactRepo.findById.mockResolvedValue(contact);
    emailVerificationService.verifyEmail.mockResolvedValue(verificationResult);
    verificationRepo.upsert.mockResolvedValue(savedEntity);

    await useCase.execute({ contactId, email }, userId);

    const upsertArg = verificationRepo.upsert.mock.calls[0][0];
    expect(upsertArg.verifiedAt).toBeInstanceOf(Date);
  });
});
