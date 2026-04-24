import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetCompanyUseCase } from './get-company.use-case';
import { ICompanyRepository, CompanyEntity } from '../repositories/company.repository';

const makeCompanyRepo = (): jest.Mocked<ICompanyRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySelectionId: jest.fn(),
  findBySelectionIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('GetCompanyUseCase', () => {
  let useCase: GetCompanyUseCase;
  let repo: jest.Mocked<ICompanyRepository>;

  const company: CompanyEntity = {
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
    useCase = new GetCompanyUseCase(repo);
  });

  it('should return company when userId matches', async () => {
    repo.findById.mockResolvedValue(company);

    const result = await useCase.execute('comp-1', 'user-1');

    expect(repo.findById).toHaveBeenCalledWith('comp-1');
    expect(result).toEqual(company);
  });

  it('should throw NotFoundException when company not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('comp-999', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when userId does not match', async () => {
    repo.findById.mockResolvedValue(company);

    await expect(useCase.execute('comp-1', 'other-user')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
