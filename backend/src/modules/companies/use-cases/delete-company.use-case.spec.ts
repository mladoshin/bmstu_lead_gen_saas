import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteCompanyUseCase } from './delete-company.use-case';
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

describe('DeleteCompanyUseCase', () => {
  let useCase: DeleteCompanyUseCase;
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
    useCase = new DeleteCompanyUseCase(repo);
  });

  it('should delete company when userId matches', async () => {
    repo.findById.mockResolvedValue(existing);
    repo.delete.mockResolvedValue(undefined);

    await useCase.execute('comp-1', 'user-1');

    expect(repo.findById).toHaveBeenCalledWith('comp-1');
    expect(repo.delete).toHaveBeenCalledWith('comp-1');
  });

  it('should throw NotFoundException when company not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('comp-999', 'user-1')).rejects.toThrow(
      NotFoundException,
    );

    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when userId does not match', async () => {
    repo.findById.mockResolvedValue(existing);

    await expect(useCase.execute('comp-1', 'other-user')).rejects.toThrow(
      ForbiddenException,
    );

    expect(repo.delete).not.toHaveBeenCalled();
  });
});
