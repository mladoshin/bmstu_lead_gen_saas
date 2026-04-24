import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ExportContactsUseCase } from './export-contacts.use-case';
import { ISelectionReader, SelectionEntity } from '../../search/repositories/selection.repository';
import { ISelectionWriter } from '../../search/repositories/selection.repository';
import { ICompanyRepository, CompanyEntity } from '../../companies/repositories/company.repository';
import { IContactRepository, ContactEntity } from '../../contacts/repositories/contact.repository';
import { ExportMapper } from '../mappers/export.mapper';

const makeSelectionReader = (): jest.Mocked<ISelectionReader> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
});

const makeSelectionWriter = (): jest.Mocked<ISelectionWriter> => ({
  create: jest.fn(),
  updateStatus: jest.fn(),
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

const makeSelection = (overrides: Partial<SelectionEntity> = {}): SelectionEntity => ({
  id: 'sel-1',
  userId: 'user-1',
  name: 'IT — Moscow',
  industry: 'IT',
  cities: ['Moscow'],
  companyLimit: 10,
  targetRoles: ['CEO'],
  status: 'in_progress',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ExportContactsUseCase', () => {
  let useCase: ExportContactsUseCase;
  let selectionReader: jest.Mocked<ISelectionReader>;
  let selectionWriter: jest.Mocked<ISelectionWriter>;
  let companyRepo: jest.Mocked<ICompanyRepository>;
  let contactRepo: jest.Mocked<IContactRepository>;
  let exportMapper: ExportMapper;

  beforeEach(() => {
    selectionReader = makeSelectionReader();
    selectionWriter = makeSelectionWriter();
    companyRepo = makeCompanyRepo();
    contactRepo = makeContactRepo();
    exportMapper = new ExportMapper();
    useCase = new ExportContactsUseCase(
      selectionReader,
      selectionWriter,
      companyRepo,
      contactRepo,
      exportMapper,
    );
  });

  const selectionId = 'sel-1';
  const userId = 'user-1';

  it('should return CSV on successful export', async () => {
    selectionReader.findById.mockResolvedValue(makeSelection());
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      { id: 'comp-1' } as CompanyEntity,
    ]);
    contactRepo.findByCompanyIds.mockResolvedValue([
      {
        id: 'c1',
        companyId: 'comp-1',
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        position: 'CEO',
        seniority: 'C-level',
        email: 'john@acme.com',
        phone: '+7999',
        linkedin: null,
        telegram: null,
        confidenceScore: 0.9,
        source: 'openai_web_search',
        createdAt: new Date(),
      } as ContactEntity,
    ]);
    selectionWriter.updateStatus.mockResolvedValue(makeSelection({ status: 'completed' }));

    const csv = await useCase.execute(selectionId, userId);

    expect(csv).toContain('id,first_name,last_name');
    expect(csv).toContain('"John"');
    expect(csv).toContain('"Doe"');
  });

  it('should throw NotFoundException when selection not found', async () => {
    selectionReader.findById.mockResolvedValue(null);

    await expect(useCase.execute(selectionId, userId)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when userId does not match', async () => {
    selectionReader.findById.mockResolvedValue(makeSelection({ userId: 'other-user' }));

    await expect(useCase.execute(selectionId, userId)).rejects.toThrow(ForbiddenException);
  });

  it('should call updateStatus with completed', async () => {
    selectionReader.findById.mockResolvedValue(makeSelection());
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([]);
    contactRepo.findByCompanyIds.mockResolvedValue([]);
    selectionWriter.updateStatus.mockResolvedValue(makeSelection({ status: 'completed' }));

    await useCase.execute(selectionId, userId);

    expect(selectionWriter.updateStatus).toHaveBeenCalledWith(selectionId, 'completed');
  });
});
