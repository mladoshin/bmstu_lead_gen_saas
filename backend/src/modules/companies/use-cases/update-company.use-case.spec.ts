import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateCompanyUseCase } from './update-company.use-case';
import { ICompanyRepository, CompanyEntity } from '../repositories/company.repository';
import { UpdateCompanyDto } from '../dto/update-company.dto';

const makeCompanyRepo = (): jest.Mocked<ICompanyRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySelectionId: jest.fn(),
  findBySelectionIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UpdateCompanyUseCase', () => {
  let useCase: UpdateCompanyUseCase;
  let repo: jest.Mocked<ICompanyRepository>;

  const existing: CompanyEntity = {
    id: 'comp-1',
    selectionId: 'sel-1',
    userId: 'user-1',
    name: 'Acme Corp',
    industry: 'Tech',
    city: 'Moscow',
    website: null,
    domain: null,
    phone: null,
    emailGeneral: null,
    country: null,
    address: null,
    source: 'manual',
    createdAt: new Date(),
  };

  beforeEach(() => {
    repo = makeCompanyRepo();
    useCase = new UpdateCompanyUseCase(repo);
  });

  it('should update company with valid data', async () => {
    const dto: UpdateCompanyDto = { name: 'Acme Updated', city: 'SPb' };

    const updated: CompanyEntity = {
      ...existing,
      name: 'Acme Updated',
      city: 'SPb',
    };

    repo.findById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('comp-1', dto, 'user-1');

    expect(repo.findById).toHaveBeenCalledWith('comp-1');
    expect(repo.update).toHaveBeenCalledWith('comp-1', dto);
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException when company not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('comp-999', { name: 'X' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when userId does not match', async () => {
    repo.findById.mockResolvedValue(existing);

    await expect(
      useCase.execute('comp-1', { name: 'X' }, 'other-user'),
    ).rejects.toThrow(ForbiddenException);

    expect(repo.update).not.toHaveBeenCalled();
  });
});
