import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ExportCompaniesUseCase } from './export-companies.use-case';
import { ISelectionReader, SelectionEntity } from '../../search/repositories/selection.repository';
import { ISelectionWriter } from '../../search/repositories/selection.repository';
import { ICompanyRepository, CompanyEntity } from '../../companies/repositories/company.repository';
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

describe('ExportCompaniesUseCase', () => {
  let useCase: ExportCompaniesUseCase;
  let selectionReader: jest.Mocked<ISelectionReader>;
  let selectionWriter: jest.Mocked<ISelectionWriter>;
  let companyRepo: jest.Mocked<ICompanyRepository>;
  let exportMapper: ExportMapper;

  beforeEach(() => {
    selectionReader = makeSelectionReader();
    selectionWriter = makeSelectionWriter();
    companyRepo = makeCompanyRepo();
    exportMapper = new ExportMapper();
    useCase = new ExportCompaniesUseCase(
      selectionReader,
      selectionWriter,
      companyRepo,
      exportMapper,
    );
  });

  const selectionId = 'sel-1';
  const userId = 'user-1';

  it('should return CSV on successful export', async () => {
    selectionReader.findById.mockResolvedValue(makeSelection());
    companyRepo.findBySelectionIdAndUserId.mockResolvedValue([
      {
        id: 'comp-1',
        selectionId: 'sel-1',
        userId: 'user-1',
        name: 'Acme',
        industry: 'IT',
        city: 'Moscow',
        website: 'https://acme.com',
        domain: 'acme.com',
        phone: '+7999',
        emailGeneral: 'info@acme.com',
        country: 'Russia',
        address: '123 Main St',
        source: 'google_maps',
        createdAt: new Date(),
      } as CompanyEntity,
    ]);
    selectionWriter.updateStatus.mockResolvedValue(makeSelection({ status: 'completed' }));

    const csv = await useCase.execute(selectionId, userId);

    expect(csv).toContain('id,name,industry,city');
    expect(csv).toContain('"Acme"');
    expect(csv).toContain('"Moscow"');
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
    selectionWriter.updateStatus.mockResolvedValue(makeSelection({ status: 'completed' }));

    await useCase.execute(selectionId, userId);

    expect(selectionWriter.updateStatus).toHaveBeenCalledWith(selectionId, 'completed');
  });
});
